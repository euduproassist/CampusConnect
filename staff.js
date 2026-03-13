import { db } from './firebase-config.js';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

let selectedTicketId = null;

const q = query(collection(db, "supportTickets"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById("ticketBody");
    tbody.innerHTML = "";
    snapshot.forEach((doc) => {
        const data = doc.data();
        const row = `<tr onclick="selectTicket('${doc.id}')" style="cursor:pointer;">
            <td>${data.email || 'N/A'}</td>
            <td>${data.studentNumber}</td>
            <td>${data.category}</td>
            <td><span class="status-pill">${data.status}</span></td>
            <td>${data.createdAt.toDate().toLocaleDateString()}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
});

window.selectTicket = async (id) => {
    selectedTicketId = id;
    const docSnap = await getDoc(doc(db, "supportTickets", id));
    const data = docSnap.data();
    
    document.getElementById("detailsPanel").style.display = 'block';
    // Now including Email in the details view
    document.getElementById("detailText").innerText = 
        `Student Email: ${data.email}\n` + 
        `Student Number: ${data.studentNumber}\n` + 
        `Query: ${data.category}\n` + 
        `Description: ${data.message}`;
};

window.updateStatus = async (newStatus) => {
    if (!selectedTicketId) return;
    await updateDoc(doc(db, "supportTickets", selectedTicketId), { status: newStatus });
    alert("Status updated to " + newStatus);
};

