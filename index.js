const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendPushNotification = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const msg = event.data?.data();
    if (!msg || !msg.senderId) return null;

    const chatId = event.params.chatId;
    const senderId = msg.senderId;

    // Extraer receiverId: el chatId tiene formato "id1_id2"
    // donde cada id puede contener underscores (ej: carolina_1780891559264)
    // Removemos el senderId del chatId para obtener el receiverId
    let receiverId = null;
    if (chatId.startsWith(senderId + "_")) {
      receiverId = chatId.slice(senderId.length + 1);
    } else if (chatId.endsWith("_" + senderId)) {
      receiverId = chatId.slice(0, chatId.length - senderId.length - 1);
    }

    console.log(`chatId: ${chatId} | senderId: ${senderId} | receiverId: ${receiverId}`);
    if (!receiverId) return null;

    const tokenDoc = await admin.firestore()
      .collection("fcmTokens").doc(receiverId).get();
    
    console.log(`fcmToken doc exists: ${tokenDoc.exists} para receiverId: ${receiverId}`);
    if (!tokenDoc.exists) return null;

    const token = tokenDoc.data().token;
    if (!token) return null;

    const senderDoc = await admin.firestore()
      .collection("users").doc(senderId).get();
    const senderName = senderDoc.exists ? senderDoc.data().name : "Alguien";

    const text = msg.type === "image" ? "📷 Imagen" :
                 msg.type === "voice" ? "🎙️ Audio" :
                 (msg.text || "Nuevo mensaje").slice(0, 100);

    try {
      await admin.messaging().send({
        token,
        notification: {title: senderName, body: text},
        webpush: {
          fcmOptions: {link: "https://gabo440.github.io/Isabella-chat/"},
        },
      });
      console.log(`Notificación enviada a ${receiverId} ✅`);
    } catch (e) {
      console.error(`Error enviando notificación a ${receiverId}:`, e.message);
    }

    return null;
  }
);
