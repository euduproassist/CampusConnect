import { auth, db, storage } from './firebase-config.js';
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 1. Ensure User is Auth'd
// Firebase Auth automatically links the user. 
// auth.currentUser.uid gives you the unique ID.

window.submitTicket = async () => {
    const user = auth.currentUser;
    const file = document.getElementById('fileUpload').files[0];
    
    let fileUrl = "";
    if(file) {
        const storageRef = ref(storage, 'tickets/' + file.name);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "supportTickets"), {
        studentId: user.uid,
        email: user.email,
        category: document.getElementById('queryType').value,
        message: document.getElementById('desc').value,
        attachment: fileUrl,
        status: "Pending",
        createdAt: new Date()
    });
    
    alert("Ticket Submitted! Check your email for updates.");
};
