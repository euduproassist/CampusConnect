import { auth, db, storage } from './firebase-config.js';
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

window.submitTicket = async () => {
    const loading = document.getElementById('loading');

        const studentNum = document.getElementById('studentNum').value;
        const email = document.getElementById('emailAddr').value;
        const category = document.getElementById('queryType').value;
        const message = document.getElementById('desc').value;

        if (!studentNum || !email || !message) {
    alert("Please fill in all required fields.");
    loading.style.display = 'none';
    return;
}
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
            studentNumber: studentNum,
            email: email,
            category: category,
            message: message,
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


