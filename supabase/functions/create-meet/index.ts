// Edge Function Supabase : confirme une séance et crée un Google Meet.
// Un événement Google Agenda est créé avec les emails du tuteur et de l'étudiant (invitations envoyées par Google).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: { user } } = await admin.auth.getUser(jwt);
    if (!user) return json({ error: 'Non connecté' }, 401);

    const { appointment_id } = await req.json();
    const { data: a } = await admin.from('appointments').select('*').eq('id', appointment_id).maybeSingle();
    if (!a || a.tutor_id !== user.id) return json({ error: 'Seul le tuteur peut confirmer cette séance' }, 403);
    if (a.status !== 'pending') return json({ error: 'Cette demande a déjà été traitée' }, 409);

    const [t, s] = await Promise.all([admin.auth.admin.getUserById(a.tutor_id), admin.auth.admin.getUserById(a.student_id)]);
    const emails = [t.data.user?.email, s.data.user?.email].filter(Boolean).map((email) => ({ email }));
    if (emails.length < 2) return json({ error: 'Emails introuvables' }, 500);

    // Jeton d'accès Google à partir du refresh token du compte organisateur
    const tok = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        refresh_token: Deno.env.get('GOOGLE_REFRESH_TOKEN')!,
        grant_type: 'refresh_token',
      }),
    }).then((r) => r.json());
    if (!tok.access_token) return json({ error: 'Connexion à Google impossible (voir les secrets de la fonction)' }, 502);

    const start = new Date(a.scheduled_at), end = new Date(start.getTime() + 30 * 60000);
    const ev = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: `YNJ Campus : ${a.subject}`,
          description: `Question de l'étudiant : ${a.question}`,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
          attendees: emails,
          conferenceData: { createRequest: { requestId: a.id, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
        }),
      },
    ).then((r) => r.json());
    if (!ev.hangoutLink) return json({ error: 'Google n’a pas créé le lien Meet' }, 502);

    await admin.from('appointments').update({ status: 'confirmed', meet_url: ev.hangoutLink }).eq('id', a.id);
    return json({ meet_url: ev.hangoutLink });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
