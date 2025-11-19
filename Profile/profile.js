/* ============================
   PROFILE PAGE SCRIPT
   API Base: https://narpavihoney.brandmindz.com
   ============================ */

   const API_BASE = "https://narpavihoney.brandmindz.com/routes/profile";

   // ======== Auth Protection ======== //
   // Protect this page - redirect if not logged in
   if (!AuthUtils.initPageProtection()) {
     // Page protection failed, will redirect to login
     throw new Error('Authentication required');
   }

   // ======== Logged-in user from localStorage ======== //
   let userData = null;
   let user_id = null;
   
   try {
     const raw = localStorage.getItem("user");
     if (raw) {
       userData = JSON.parse(raw);
       user_id = userData.id;
     }
   } catch (e) {
     console.error("Error parsing user data:", e);
   }
   
   if (!user_id) {
     alert("Please login again.");
     AuthUtils.logout();
   }
   
   // ======== DOM Elements (Profile) ======== //
   const fullNameInput = document.getElementById("full-name");
   const emailInput = document.getElementById("email");
   const phoneInput = document.getElementById("phone");
   const dobInput = document.getElementById("dob");
   const saveProfileBtn = document.getElementById("save-profile-btn");
   
   const sidebarName = document.getElementById("sidebar-name");
   const sidebarEmail = document.getElementById("sidebar-email");
   
   // ========== PROFILE IMAGE UPLOAD ELEMENTS ==========
   const profileUpload = document.getElementById("profile-upload");
   const profileImage = document.getElementById("profile-image");
   const imageLoader = document.getElementById("image-loader");
   const sidebarProfileImg = document.getElementById("sidebar-profile-img");
   
   /* ============ Fetch PROFILE ============ */
   
   async function fetchProfile() {
     try {
       const fd = new FormData();
       fd.append("user_id", user_id);
   
       const res = await fetch(`${API_BASE}/get_profile.php`, {
         method: "POST",
         body: fd,
       });
   
       const data = await res.json();
   
       if (data.status === "success" && data.data) {
         const user = data.data;
   
         // ====== IMAGE LOADING ======
         if (user.profile_image && user.profile_image !== "") {
           profileImage.src = user.profile_image;
           sidebarProfileImg.src = user.profile_image;
         } else {
           profileImage.src = "./Images/default-user.png";
           sidebarProfileImg.src = "./Images/default-user.png";
         }
   
         // Fill inputs
         fullNameInput.value = user.name || "";
         emailInput.value = user.email || "";
         phoneInput.value = user.phone || "";
         dobInput.value = user.dob || "";
   
         // Sidebar
         sidebarName.textContent = user.name || "User";
         sidebarEmail.textContent = user.email || "";
       } else {
         console.error("Profile fetch error:", data.message);
       }
     } catch (err) {
       console.error("Profile fetch failed:", err);
     }
   }
   
   /* ============ Update PROFILE ============ */
   
   saveProfileBtn.addEventListener("click", async () => {
     try {
       const fd = new FormData();
       fd.append("user_id", user_id);
       fd.append("name", fullNameInput.value.trim());
       fd.append("email", emailInput.value.trim());
       fd.append("phone", phoneInput.value.trim());
       fd.append("dob", dobInput.value || "");
       fd.append("gender", "");
       fd.append("profile_image", "");
   
       const res = await fetch(`${API_BASE}/update_profile.php`, {
         method: "POST",
         body: fd,
       });
   
       const data = await res.json();
   
       if (data.status === "success") {
         showPopup("Profile updated successfully!", "success");
   
         // update localStorage so navbar/header shows latest name & email
         if (userData) {
           userData.name = fullNameInput.value.trim();
           userData.email = emailInput.value.trim();
           localStorage.setItem("user", JSON.stringify(userData));
         }
   
         await fetchProfile();
       } else {
         showPopup(data.message || "Failed to update profile", "error");
       }
     } catch (err) {
       console.error("Profile update error:", err);
       showPopup("Something went wrong while updating profile.", "error");
     }
   });
   
   /* ======================================
      MULTIPLE ADDRESS MANAGEMENT (C1)
      Uses: get_all_addresses.php, save_address.php, delete_address.php
   ====================================== */
   
   // DOM elements (MULTI-ADDRESS)
   const addressList = document.getElementById("address-list");
   const addAddressBtn = document.getElementById("add-address-btn");
   const addressModal = document.getElementById("address-modal");
   
   const modalTitle = document.getElementById("modal-title");
   const modalSaveBtn = document.getElementById("modal-save");
   const modalCancelBtn = document.getElementById("modal-cancel");
   modalCancelBtn.addEventListener("click", closeAddressModal);

   
   // Modal input fields
   document.getElementById("modal-close-btn").addEventListener("click", closeAddressModal);
   const addrType = document.getElementById("addr-type");
   const addrFullName = document.getElementById("addr-full-name");
   const addrPhone = document.getElementById("addr-phone");
   const addrLine1 = document.getElementById("addr-line1");
   const addrLine2 = document.getElementById("addr-line2");
   const addrCity = document.getElementById("addr-city");
   const addrState = document.getElementById("addr-state");
   const addrPincode = document.getElementById("addr-pincode");
   const addrCountry = document.getElementById("addr-country");
   const addrLandmark = document.getElementById("addr-landmark");
   const addrDefault = document.getElementById("addr-default");
   
   let editingAddressId = null;
   
   /* ============================
      OPEN MODAL (Add or Edit)
   ============================ */
   function openAddressModal(isEdit = false, data = null) {
    addressModal.classList.remove("hidden");
    addressModal.classList.add("flex"); // ensure modal flex centering
    document.body.style.overflow = "hidden"; // stop background scrolling
  
    if (isEdit && data) {
      modalTitle.textContent = "Edit Address";
      editingAddressId = data.id;
  
      addrType.value = data.address_type;
      addrFullName.value = data.full_name;
      addrPhone.value = data.phone;
      addrLine1.value = data.address_line1;
      addrLine2.value = data.address_line2 || "";
      addrCity.value = data.city;
      addrState.value = data.state;
      addrPincode.value = data.pincode;
      addrCountry.value = data.country;
      addrLandmark.value = data.landmark || "";
      addrDefault.checked = data.is_default == 1;
    } else {
      modalTitle.textContent = "Add Address";
      editingAddressId = null;
  
      addrType.value = "Home";
      addrFullName.value = fullNameInput.value;
      addrPhone.value = phoneInput.value;
      addrLine1.value = "";
      addrLine2.value = "";
      addrCity.value = "";
      addrState.value = "";
      addrPincode.value = "";
      addrCountry.value = "India";
      addrLandmark.value = "";
      addrDefault.checked = false;
    }
  }
  
   
   /* ============================
      CLOSE MODAL
   ============================ */
   modalCancelBtn.addEventListener("click", () => {
     addressModal.classList.add("hidden");
   });
   
   /* ============================
      LOAD ALL ADDRESSES
   ============================ */
   async function loadAddresses() {
     const fd = new FormData();
     fd.append("user_id", user_id);
   
     try {
       const res = await fetch(`${API_BASE}/get_all_addresses.php`, {
         method: "POST",
         body: fd,
       });
   
       const result = await res.json();
       addressList.innerHTML = "";
   
       if (result.status === "success" && result.data.length > 0) {
         result.data.forEach((addr) => {
           const card = document.createElement("div");
           card.className =
             "border rounded-lg p-4 shadow-soft bg-[#fffefc] flex justify-between items-start";
   
           card.innerHTML = `
             <div>
               <h4 class="font-semibold text-[#8B4513]">
                 ${addr.address_type}
                 ${
                   addr.is_default == 1
                     ? '<span class="text-green-600 ml-2">(Default)</span>'
                     : ""
                 }
               </h4>
   
               <p class="text-sm text-gray-700">
                 ${addr.full_name}<br>
                 ${addr.phone}<br>
                 ${addr.address_line1}<br>
                 ${addr.address_line2 ? addr.address_line2 + "<br>" : ""}
                 ${addr.city}, ${addr.state}<br>
                 ${addr.country} - ${addr.pincode}<br>
                 ${addr.landmark ? "Landmark: " + addr.landmark : ""}
               </p>
             </div>
   
             <div class="flex flex-col items-end gap-2">
               <button
                 class="text-sm px-3 py-1 border border-[#8B4513] rounded-md text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                 onclick='openAddressModal(true, ${JSON.stringify(addr)})'>
                 Edit
               </button>
   
               <button
                 class="text-sm px-3 py-1 border border-red-500 rounded-md text-red-500 hover:bg-red-500 hover:text-white"
                 onclick="deleteAddress(${addr.id})">
                 Delete
               </button>
             </div>
           `;
   
           addressList.appendChild(card);
         });
       } else {
         addressList.innerHTML =
           '<p class="text-gray-600">No addresses saved yet.</p>';
       }
     } catch (err) {
       console.error("Error loading addresses:", err);
       addressList.innerHTML =
         '<p class="text-red-500 text-sm">Failed to load addresses.</p>';
     }
   }

   function closeAddressModal() {
    addressModal.classList.add("hidden");
    addressModal.classList.remove("flex");
    document.body.style.overflow = "auto";
  
    // reset form so it always opens fresh
    editingAddressId = null;
  
    addrType.value = "Home";
    addrFullName.value = fullNameInput.value || "";
    addrPhone.value = phoneInput.value || "";
    addrLine1.value = "";
    addrLine2.value = "";
    addrCity.value = "";
    addrState.value = "";
    addrPincode.value = "";
    addrCountry.value = "India";
    addrLandmark.value = "";
    addrDefault.checked = false;
  }

  
  addressModal.addEventListener("click", (e) => {
    if (e.target === addressModal) {
      closeAddressModal();
    }
  });
   
   /* ============================
      SAVE ADDRESS (Add or Edit)
   ============================ */
   modalSaveBtn.addEventListener("click", async () => {
     const fd = new FormData();
   
     fd.append("user_id", user_id);
     if (editingAddressId) fd.append("address_id", editingAddressId);
   
     fd.append("address_type", addrType.value);
     fd.append("full_name", addrFullName.value);
     fd.append("phone", addrPhone.value);
     fd.append("address_line1", addrLine1.value);
     fd.append("address_line2", addrLine2.value);
     fd.append("city", addrCity.value);
     fd.append("state", addrState.value);
     fd.append("pincode", addrPincode.value);
     fd.append("country", addrCountry.value);
     fd.append("landmark", addrLandmark.value);
     fd.append("is_default", addrDefault.checked ? 1 : 0);
   
     try {
       const res = await fetch(`${API_BASE}/save_address.php`, {
         method: "POST",
         body: fd,
       });
   
       const result = await res.json();
   
       if (result.status === "success") {
         addressModal.classList.add("hidden");
         await loadAddresses();
         showPopup("Address saved successfully!", "success");
       } else {
         showPopup(result.message || "Failed to save address", "error");
       }
     } catch (err) {
       console.error("Save address error:", err);
       showPopup("Something went wrong while saving address.", "error");
     }
   });

   
   
   /* ============================
      DELETE ADDRESS
   ============================ */
   async function deleteAddress(id) {
     if (!confirm("Delete this address?")) return;
   
     const fd = new FormData();
     fd.append("address_id", id);
     fd.append("user_id", user_id);
   
     try {
       const res = await fetch(`${API_BASE}/delete_address.php`, {
         method: "POST",
         body: fd,
       });
   
       const result = await res.json();
   
       if (result.status === "success") {
         await loadAddresses();
         showPopup("Address deleted!", "success");
       } else {
         showPopup(result.message || "Failed to delete address", "error");
       }
     } catch (err) {
       console.error("Delete address error:", err);
       showPopup("Something went wrong while deleting address.", "error");
     }
   }
   
   /* ============================
      ADD ADDRESS BUTTON
   ============================ */
   addAddressBtn.addEventListener("click", () => openAddressModal(false));
   
   /* ============ INIT PAGE ============ */
   
   document.addEventListener("DOMContentLoaded", () => {
     fetchProfile();
     loadAddresses(); // 🔹 use multi-address loader ONLY
   });
   
   /* ============ POPUP MODAL ============ */
   
   function showPopup(message, type = "success") {
     const modal = document.getElementById("popupModal");
     const msg = document.getElementById("popupMessage");
     const icon = document.getElementById("popupIcon");
   
     msg.textContent = message;
   
     if (type === "success") {
       icon.innerHTML = `
         <svg width="50" height="50" class="text-green-600 mx-auto" viewBox="0 0 24 24" fill="none">
           <circle cx="12" cy="12" r="10" stroke="green" stroke-width="2"/>
           <path d="M8 12l3 3l5-6" stroke="green" stroke-width="2" fill="none"/>
         </svg>`;
     } else {
       icon.innerHTML = `
         <svg width="50" height="50" class="text-red-600 mx-auto" fill="none" viewBox="0 0 24 24">
           <circle cx="12" cy="12" r="10" stroke="red" stroke-width="2"/>
           <path d="M15 9l-6 6M9 9l6 6" stroke="red" stroke-width="2"/>
         </svg>`;
     }
   
     modal.classList.remove("hidden");
     modal.style.display = "flex";
   
     setTimeout(() => {
       modal.style.display = "none";
     }, 2000);
   }
   
   /* ========== PROFILE IMAGE UPLOAD ========== */
   
   profileUpload.addEventListener("change", async () => {
     if (!profileUpload.files.length) return;
   
     const file = profileUpload.files[0];
   
     // Show loader
     imageLoader.classList.remove("hidden");
     profileImage.style.opacity = "0.4";
   
     const fd = new FormData();
     fd.append("user_id", user_id);
     fd.append("profile_image", file);
   
     try {
       const res = await fetch(`${API_BASE}/upload_profile_image.php`, {
         method: "POST",
         body: fd,
       });
   
       const data = await res.json();
   
       if (data.status === "success") {
         const imgUrl = data.image_url;
   
         profileImage.src = imgUrl;
         sidebarProfileImg.src = imgUrl;
   
         if (userData) {
           userData.profile_image = imgUrl;
           localStorage.setItem("user", JSON.stringify(userData));
         }
   
         showPopup("Profile picture updated!", "success");
       } else {
         showPopup(data.message || "Upload failed", "error");
       }
     } catch (err) {
       console.error("Upload error:", err);
       showPopup("Error uploading file", "error");
     }
   
   imageLoader.classList.add("hidden");
   profileImage.style.opacity = "1";
 });

 // ======== LOGOUT FUNCTIONALITY ======== //
 const logoutBtn = document.getElementById("logout-btn");
 if (logoutBtn) {
   logoutBtn.addEventListener("click", (e) => {
     e.preventDefault();
     
     // Confirm logout
     if (confirm("Are you sure you want to logout?")) {
       AuthUtils.logout();
     }
   });
 }