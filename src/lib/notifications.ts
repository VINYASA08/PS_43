export function sendExternalAlert(recipientRole: string, eventType: string, data: any) {
  console.log(`\n========== EXTERNAL NOTIFICATION MOCK ==========`);
  console.log(`[TO]: ${recipientRole.toUpperCase()}`);
  console.log(`[EVENT]: ${eventType}`);
  console.log(`[DATA]:`, JSON.stringify(data, null, 2));
  console.log(`[MESSAGE_VIA]: EMAIL & WHATSAPP`);
  console.log(`================================================\n`);
}
