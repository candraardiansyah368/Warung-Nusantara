import {
    db,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    Timestamp,
    doc,
    updateDoc
} from "./firebase.js";

// ==============================
// ELEMENT HTML
// ==============================

const restaurantSelect = document.getElementById("restaurantSelect");
const menuList = document.getElementById("menu-list");
const menuSelect = document.getElementById("menuSelect");
const orderForm = document.getElementById("orderForm");
const orderTable = document.getElementById("orderTable");
const qtyInput = document.getElementById("qty");
const totalPrice = document.getElementById("totalPrice");


// ==============================
// ARRAY MENU
// ==============================

let menus = [];
function updateTotalPrice() {

    const menuId = menuSelect.value;
    const qty = parseInt(qtyInput.value) || 0;

    const menu = menus.find(item => item.id === menuId);

    if (!menu) {
        totalPrice.textContent = "Rp 0";
        return;
    }

    const total = Number(menu.price) * qty;

    totalPrice.textContent =
        "Rp " + total.toLocaleString("id-ID");
}
// ==============================
// LOAD MENU FIRESTORE
// ==============================

async function loadMenu() {

    menuList.innerHTML = "";
    menuSelect.innerHTML = "<option value=''>Pilih Menu</option>";

    menus = []; 

    const restaurantId = restaurantSelect.value;

    const snapshot = await getDocs(
        collection(
            db,
            "restaurants",
            restaurantId,
            "menus"
        )
    );

    snapshot.forEach((doc) => {

        const data = doc.data();

        menus.push({
            id: doc.id,
            ...data
        });

        menuList.innerHTML += `

        <div class="menu-card">

            <img src="images/${data.imageUrl}" alt="${data.name}">

            <div class="menu-content">

                <h3>${data.name}</h3>

                <p>${data.category}</p>

                <h2 class="price">
                    Rp ${Number(data.price).toLocaleString("id-ID")}
                </h2>

            </div>

        </div>

        `;

        menuSelect.innerHTML += `

        <option value="${doc.id}">
            ${data.name}
        </option>

        `;

    });

    updateTotalPrice();

}

// ==============================
// PERTAMA KALI
// ==============================

loadMenu();
menuSelect.addEventListener("change", updateTotalPrice);

qtyInput.addEventListener("input", updateTotalPrice);

// ==============================
// GANTI CABANG
// ==============================

restaurantSelect.addEventListener("change", loadMenu);
// ==============================
// SIMPAN PESANAN
// ==============================

orderForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const customerName = document.getElementById("customerName").value;
    const customerPhone = document.getElementById("customerPhone").value;
    const tableNumber = parseInt(document.getElementById("tableNumber").value);
    const qty = parseInt(document.getElementById("qty").value);

    const menuId = menuSelect.value;

    if (menuId === "") {
        alert("Silakan pilih menu!");
        return;
    }

    const menu = menus.find(item => item.id === menuId);

    if (!menu) {
        alert("Menu tidak ditemukan!");
        return;
    }

    const subtotal = qty * Number(menu.price);

    // ==========================
    // SIMPAN CUSTOMER
    // ==========================

    const customerId = customerName;

    // ==========================
    // SIMPAN ORDER
    // ==========================

    const orderRef = await addDoc(
        collection(db, "orders"),
        {
            customerId: customerId,
            customerName: customerName,
            customerPhone: customerPhone,
            restaurantId: restaurantSelect.value,
            tableNumber: tableNumber,
            status: "pending",
            totalPrice: subtotal,
            createdAt: Timestamp.now()
        }
    );

    // ==========================
    // SIMPAN ORDER ITEM
    // ==========================

    await addDoc(
        collection(db, "orders", orderRef.id, "orderItems"),
        {
            menuId: menu.id,
            menuName: menu.name,
            qty: qty,
            unitPrice: Number(menu.price),
            subtotal: subtotal
        }
    );

    alert("Pesanan berhasil disimpan!");

    orderForm.reset();

    menuSelect.innerHTML = "<option value=''>Pilih Menu</option>";

    loadMenu();

});

// ==============================
// TAMPILKAN PESANAN REALTIME
// ==============================

onSnapshot(collection(db, "orders"), async (snapshot) => {

    orderTable.innerHTML = "";

    for (const orderDoc of snapshot.docs) {

        const order = orderDoc.data();

        // Ambil nama customer langsung dari orders
        let customerName = order.customerName || "-";
        let menuName = "-";
        let qty = "-";

        // ==========================
        // AMBIL ORDER ITEM
        // ==========================

        const itemSnapshot = await getDocs(
            collection(db, "orders", orderDoc.id, "orderItems")
        );

        itemSnapshot.forEach((doc) => {
            menuName = doc.data().menuName;
            qty = doc.data().qty;
        });

        orderTable.innerHTML += `
<tr>
    <td>${customerName}</td>
    <td>${order.tableNumber}</td>
    <td>${menuName}</td>
    <td>${qty}</td>
    <td>Rp ${Number(order.totalPrice).toLocaleString("id-ID")}</td>
    <td>${order.status}</td>

    <td>
        <button onclick="updateStatus('${orderDoc.id}', 'Diproses')">
            Proses
        </button>

        <button onclick="updateStatus('${orderDoc.id}', 'Selesai')">
            Selesai
        </button>
    </td>
</tr>
`;
    }

});

window.updateStatus = async (id, status) => {

    try {

        await updateDoc(
            doc(db, "orders", id),
            {
                status: status
            }
        );

    } catch (error) {

        console.error(error);

    }

};