import { auth, db, storage } from './firebase-config.js';
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";


import { auth, db, storage } from './firebase-config.js';
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

window.submitTicket = async () => {
    const loading = document.getElementById('loading');
    loading.style.display = 'block'; // Show loading

    try {
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
        
        alert("Ticket Submitted!");
        document.getElementById('ticketModal').style.display = 'none'; // Close modal
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        loading.style.display = 'none'; // Hide loading
    }
};

// Add this to open the modal
window.openTicketModal = (category) => {
    document.getElementById('ticketModal').style.display = 'flex';
    document.getElementById('queryType').innerHTML = `<option>${category}</option>`;
};
