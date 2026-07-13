// Verschickt Push-Nachrichten über Expos kostenlosen Push-Dienst.
// Braucht keinen eigenen API-Key — jeder gültige Expo-Push-Token reicht.
export async function sendPushNotifications(
  tokens: (string | null | undefined)[],
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const validTokens = tokens.filter(
    (t): t is string => !!t && t.startsWith("ExponentPushToken")
  );
  if (validTokens.length === 0) return;

  const messages = validTokens.map((to) => ({ to, sound: "default", title, body, data }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });
}
