import { auth, db, storage } from './firebase-config.js';
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

window.submitTicket = async () => {
    const loading = document.getElementById('loading');

        const studentNum = document.getElementById('studentNum').value;
        const email = document.getElementById('emailAddr').value;
        const category = document.getElementById('queryType').value;
        const message = document.getElementById('desc').value;

        if (!studentNum || !email || !message || !category || category === "Please select...") {
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

window.openTicketModal = (category, options) => {
    // 1. Show the modal
    document.getElementById('ticketModal').style.display = 'flex';
    
    // 2. Get the select element
    const select = document.getElementById('queryType');
    
    // 3. Clear existing options
    select.innerHTML = '';
    
    // 4. Add the category as a disabled header (optional, helps UI)
    const placeholder = document.createElement('option');
    placeholder.text = "Please select...";
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.add(placeholder);
    
    // 5. Loop through the array and add each option
    options.forEach(optionText => {
        const opt = document.createElement('option');
        opt.value = optionText;
        opt.innerHTML = optionText;
        select.appendChild(opt);
    });
};



