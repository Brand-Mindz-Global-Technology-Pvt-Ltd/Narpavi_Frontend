document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".product-container");

  // Cart elements
const cartBtn = document.getElementById("cart-btn");
const cartBadge = document.getElementById("cart-badge");
  const cartModal = document.getElementById("cart-modal");
  const closeCartBtn = document.getElementById("close-cart");
  const cartContentContainer = cartModal.querySelector(".flex-1");

  // Wishlist elements
  const wishlistBtn = document.getElementById("wishlist-btn");
  const wishlistModal = document.getElementById("wishlist-modal");
  const closeWishlistBtn = document.getElementById("close-wishlist");
  const wishlistContainer = wishlistModal.querySelector(".grid");
  const wishlistCountSpan = wishlistBtn.querySelector('span');

  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;
let cartData = [];

  let products = [];

  // --- Fetch products ---
  fetch("https://narpavihoney.brandmindz.com/routes/auth/shop/get_products.php")
    .then(res => res.json())
    .then(result => {
      products = result.products;
      container.innerHTML = "";

      products.forEach((product, index) => {
        const productCard = `
          <div class="relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 product-card cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-3" data-product-id="${product.id}">
            
            <!-- Wishlist Heart -->
            <button class="absolute top-2 right-2 add-to-wishlist-btn bg-white rounded-full p-2 shadow hover:bg-gray-100 transition z-10" data-product-id="${product.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="#8B4513" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.015-4.5-4.5-4.5-1.74 0-3.255.99-4 2.445A4.498 4.498 0 008.5 3.75 4.5 4.5 0 004 8.25c0 7.22 8 11.25 8 11.25s8-4.03 8-11.25z"/>
              </svg>
            </button>

            <img src="${product.images && product.images.length > 0 ? product.images[0] : 'assets/images/no-image.jpg'}" alt="${product.name}" class="w-full h-52 object-cover">
            
            <div class="p-4 text-center">
              <h2 class="font-semibold text-gray-800 text-lg">${product.name}</h2>
              <div class="mt-2">
                <span class="text-[#8B4513] font-semibold text-base">
                  Rs. ${product.variations && product.variations.length > 0 ? product.variations[0].amount : product.price}
                </span>
              </div>
              <div class="flex justify-center gap-2 mt-3">
                <button class="shop-now-btn bg-[#8B4513] text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-[#A0522D] transition" data-product-id="${product.id}">
                  Shop Now
                </button>
                <button class="add-cart-btn border border-[#8B4513] text-[#8B4513] text-xs font-medium px-3 py-1.5 rounded hover:bg-[#8B4513] hover:text-white transition" data-index="${index}">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        `;
        container.innerHTML += productCard;
      });

      attachProductEvents();
    })
    .catch(err => console.error(err));

  // --- Attach dynamic product card events ---
  function attachProductEvents() {
    // Click product card to go details
    document.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".shop-now-btn") || e.target.closest(".add-cart-btn") || e.target.closest(".add-to-wishlist-btn")) return;
        const productId = card.dataset.productId;
        window.location.href = `product-details.html?id=${productId}`;
      });
    });

    // Add to Cart
    document.querySelectorAll(".add-cart-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const productIndex = btn.dataset.index;
        const product = products[productIndex];
        if(!userId) { alert("Please login first."); return; }

        fetch("https://narpavihoney.brandmindz.com/routes/auth/shop/add_to_cart.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 })
        })
        .then(res => res.json())
        .then(resp => {
          if(resp.success){
            alert("Product added to cart!");
            fetchCartItems();
          } else {
            alert(resp.message || "Failed to add to cart");
          }
        });
      });
    });

    // Add to Wishlist
    document.querySelectorAll(".add-to-wishlist-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const productId = btn.dataset.productId;
        if(!userId) { alert("Please login first."); return; }

        try {
          const res = await fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/wishlist.php?action=add`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ user_id: userId, product_id: productId })
          });
          const result = await res.json();
          if(result.success){
            alert("Product added to wishlist!");
            updateWishlistBadge();
          } else {
            alert(result.message || "Failed to add to wishlist");
          }
        } catch(err) { console.error(err); alert("Something went wrong"); }
      });
    });

    // Shop Now
    document.querySelectorAll(".shop-now-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const productId = btn.dataset.productId;
        window.location.href = `product-details.html?id=${productId}`;
      });
    });
  }

 // --- Cart functionality ---
function fetchCartItems() {
  fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/get_cart.php?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success || !data.cart.length) {
        cartContentContainer.innerHTML = "<p class='text-center text-gray-500'>Your cart is empty.</p>";
        updateCartSummary(0, 0, 0); 
        return;
      }

      cartData = data.cart; // <-- IMPORTANT

      renderCartItems(); // render from cartData
    })
    .catch(err => console.error("Error fetching cart:", err));
}


function attachCartItemEvents(){
  // Remove item
  cartContentContainer.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", async () => {
      const cartId = btn.dataset.cartId;
      cartData = cartData.filter(i => i.cart_id != cartId); // remove locally
      renderCartItems(); // instant UI update
      try {
        await fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/remove_cart_item.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart_id: cartId, user_id: userId })
        });
      } catch(err){ console.error(err); }
    });
  });

  // Increase quantity
  cartContentContainer.querySelectorAll(".increase-qty").forEach(btn => {
    btn.addEventListener("click", async () => {
      const cartId = btn.dataset.cartId;
      const item = cartData.find(i => i.cart_id == cartId);
      item.quantity = parseInt(item.quantity) + 1; // instant change
      renderCartItems(); // update UI & totals instantly
      try {
        await fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/update_cart_qty.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart_id: cartId, user_id: userId, action: "increase" })
        });
      } catch(err){ console.error(err); }
    });
  });

  // Decrease quantity
  cartContentContainer.querySelectorAll(".decrease-qty").forEach(btn => {
    btn.addEventListener("click", async () => {
      const cartId = btn.dataset.cartId;
      const item = cartData.find(i => i.cart_id == cartId);
      if(item.quantity > 1){
        item.quantity = parseInt(item.quantity) - 1; // instant change
        renderCartItems(); // update UI & totals instantly
        try {
          await fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/update_cart_qty.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart_id: cartId, user_id: userId, action: "decrease" })
          });
        } catch(err){ console.error(err); }
      }
    });
  });
}

// Modified renderCartItems to use cartData from client side for instant calculation
function renderCartItems(){
  cartContentContainer.innerHTML = "";
  let subtotal = 0;
  let totalItems = 0;

  cartData.forEach(item => {
    const price = parseFloat(item.price);
    const qty = parseInt(item.quantity);
    const totalPerItem = price * qty;

    subtotal += totalPerItem;
    totalItems += qty;

    const div = document.createElement("div");
    div.className = "flex items-center justify-between bg-gray-50 rounded-xl p-3 shadow-sm mb-2";
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${item.images && item.images.length > 0 ? item.images[0] : './Images/no-image.png'}" alt="${item.name}" class="w-16 h-16 rounded-md object-contain">
        <div>
          <h4 class="font-semibold text-gray-800">${item.name}</h4>
          <p class="text-gray-600 text-sm">Rs: ${price} × ${qty} = Rs ${totalPerItem.toFixed(2)}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-2 py-1 text-gray-700 bg-gray-200 rounded decrease-qty" data-cart-id="${item.cart_id}">-</button>
        <span>${qty}</span>
        <button class="px-2 py-1 text-white bg-gray-800 rounded increase-qty" data-cart-id="${item.cart_id}">+</button>
        <button class="text-orange-600 hover:text-orange-800 remove-item" data-cart-id="${item.cart_id}" title="Remove">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h12z"/>
          </svg>
        </button>
      </div>
    `;
    cartContentContainer.appendChild(div);
  });

  updateCartSummary(subtotal, 60, totalItems); // instant calculation
  attachCartItemEvents(); // re-attach events
}

function updateCartSummary(subtotal, delivery = 0, totalItems = 0){
  const total = subtotal + delivery;

  document.getElementById("subtotal-amount").textContent = `Rs: ${subtotal.toFixed(2)}`;
  document.getElementById("delivery-amount").textContent = `Rs: ${delivery.toFixed(2)}`;
  document.getElementById("total-amount").textContent = `Rs: ${total.toFixed(2)}`;

  // UPDATE CART BADGE
  if (cartBadge) cartBadge.textContent = totalItems;
}



  cartBtn.addEventListener("click", () => {
    if(!userId) { alert("Please login first."); return; }
    fetchCartItems();
    cartModal.classList.remove("hidden");
  });
  closeCartBtn.addEventListener("click", () => cartModal.classList.add("hidden"));


// Update Cart Badge
async function updateCartBadge() {
  try {
    const res = await fetch(
      `https://narpavihoney.brandmindz.com/routes/auth/shop/get_cart.php?user_id=${userId}`
    );
    const data = await res.json();

    let totalItems = 0;

    if (data.success && data.cart.length > 0) {
      totalItems = data.cart.reduce((sum, item) => sum + Number(item.quantity), 0);
    }

    cartBadge.textContent = totalItems;
  } catch (err) {
    console.error("Failed to fetch cart count:", err);
    cartBadge.textContent = 0;
  }
}


cartBtn.addEventListener("click", () => {
  updateCartBadge();
});
  // --- Wishlist modal ---
  wishlistBtn.addEventListener("click", async () => {
    if(!userId) { alert("Please login first."); return; }
    await fetchWishlistItems();
    wishlistModal.classList.remove("hidden");
  });

  closeWishlistBtn.addEventListener("click", () => wishlistModal.classList.add("hidden"));

  async function fetchWishlistItems(){
    try {
      const res = await fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/wishlist.php?action=list&user_id=${userId}`);
      const data = await res.json();
      wishlistContainer.innerHTML = "";

      if(!data.success || !data.data.products.length){
        wishlistContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">Your wishlist is empty.</p>`;
        return;
      }

      data.data.products.forEach(product => {
        const price = product.variations && product.variations.length>0 ? product.variations[0].amount : product.price;
        const strike = product.variations && product.variations.length>0 && product.variations[0].strike_amount ? product.variations[0].strike_amount : null;

        const div = document.createElement("div");
        div.className = "border border-gray-300 rounded-xl p-4 relative shadow-sm flex gap-4 mb-2";

        div.innerHTML = `
          <button class="absolute top-3 right-3 text-[#8B4513] hover:scale-110 transition remove-wishlist" data-product-id="${product.product_id}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B4513" stroke="#8B4513" stroke-width="1.5" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.8 8.26a5.38 5.38 0 00-9.8-2.83A5.38 5.38 0 002.2 8.26c0 6.22 9.8 11.47 9.8 11.47s9.8-5.25 9.8-11.47z"/>
            </svg>
          </button>
          <img src="${product.images && product.images.length>0 ? product.images[0] : './Images/no-image.png'}" class="w-20 h-24 object-contain" />
          <div>
            <h4 class="font-semibold text-gray-800">${product.name}</h4>
            <p class="text-[#8B4513] text-base font-semibold">Rs: ${price} ${strike? `<span class="text-gray-500 line-through text-sm font-normal ml-1">Rs: ${strike}</span>`:''}</p>
            <div class="flex gap-2 mt-2">
              <button class="border border-[#8B4513] text-[#8B4513] px-3 py-1 rounded-md text-sm font-medium hover:bg-[#8B4513] hover:text-white transition add-cart" data-product-id="${product.product_id}">Add to cart</button>
              <button class="bg-[#8B4513] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-[#6F3410] transition buy-now" data-product-id="${product.product_id}">Buy Now</button>
            </div>
          </div>
        `;
        wishlistContainer.appendChild(div);
      });

      attachWishlistEvents();
    } catch(err){ console.error(err); alert("Failed to load wishlist."); }
  }

  function attachWishlistEvents(){
    // Remove from wishlist
    wishlistContainer.querySelectorAll(".remove-wishlist").forEach(btn => {
      btn.addEventListener("click", async () => {
        const pid = btn.dataset.productId;
        try {
          const res = await fetch("https://narpavihoney.brandmindz.com/routes/auth/shop/wishlist.php?action=remove", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ user_id: userId, product_id: pid })
          });
          const result = await res.json();
          if(result.success){
            btn.closest(".border").remove();
            updateWishlistBadge();
          }
        } catch(err){ console.error(err); }
      });
    });

    // Add to cart from wishlist
    wishlistContainer.querySelectorAll(".add-cart").forEach(btn => {
      btn.addEventListener("click", async () => {
        const pid = btn.dataset.productId;
        try {
          const res = await fetch("https://narpavihoney.brandmindz.com/routes/auth/shop/add_to_cart.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, product_id: pid, quantity: 1 })
          });
          const result = await res.json();
          if(result.success) alert("Product added to cart!");
        } catch(err){ console.error(err); }
      });
    });

    // Buy now
    wishlistContainer.querySelectorAll(".buy-now").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = btn.dataset.productId;
        window.location.href = `product-details.html?id=${pid}`;
      });
    });
  }

  function updateWishlistBadge(){
    const badge = document.querySelector("#wishlist-btn span");
    if(!badge) return;
    fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/wishlist.php?action=count&user_id=${userId}`)
      .then(res=>res.json())
      .then(data=>{
        badge.textContent = data.count || 0;
      });
  }

  //wishlist
 async function updateWishlistBadge() {
  try {
    const res = await fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/wishlist.php?action=count&user_id=${userId}`);
    const data = await res.json();
    if (data.success) {
      wishlistCountSpan.textContent = data.data.count;
      document.getElementById('wishlist-count').textContent = data.data.count;
    } else {
      wishlistCountSpan.textContent = 0;
      document.getElementById('wishlist-count').textContent = 0;
    }
  } catch (err) {
    console.error('Failed to fetch wishlist count:', err);
    wishlistCountSpan.textContent = 0;
    document.getElementById('wishlist-count').textContent = 0;
  }
}

// Fetch wishlist items and populate modal
async function fetchWishlistItems() {
  try {
    const res = await fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/wishlist.php?action=list&user_id=${userId}`);
    const data = await res.json();
    wishlistContainer.innerHTML = '';

    if (!data.success || !data.data.products.length) {
      wishlistContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">Your wishlist is empty.</p>`;
      return;
    }

    data.data.products.forEach(product => {
      const price = product.variations?.[0]?.amount || product.price;
      const strike = product.variations?.[0]?.strike_amount || null;

      const div = document.createElement('div');
      div.className = 'border border-gray-300 rounded-xl p-4 relative shadow-sm flex gap-4';
      div.innerHTML = `
        <button class="absolute top-3 right-3 text-[#8B4513] hover:scale-110 transition remove-wishlist" data-product-id="${product.product_id}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B4513" stroke="#8B4513" stroke-width="1.5" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.8 8.26a5.38 5.38 0 00-9.8-2.83A5.38 5.38 0 002.2 8.26c0 6.22 9.8 11.47 9.8 11.47s9.8-5.25 9.8-11.47z"/>
          </svg>
        </button>
        <img src="${product.images?.[0] || './Images/no-image.png'}" class="w-20 h-24 object-contain" />
        <div>
          <h4 class="font-semibold text-gray-800">${product.name}</h4>
          <p class="text-[#8B4513] text-base font-semibold">Rs: ${price} ${strike? `<span class="text-gray-500 line-through text-sm font-normal ml-1">Rs: ${strike}</span>`:''}</p>
          <div class="flex gap-2 mt-2">
            <button class="border border-[#8B4513] text-[#8B4513] px-3 py-1 rounded-md text-sm font-medium hover:bg-[#8B4513] hover:text-white transition add-cart" data-product-id="${product.product_id}">Add to cart</button>
            <button class="bg-[#8B4513] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-[#6F3410] transition buy-now" data-product-id="${product.product_id}">Buy Now</button>
          </div>
        </div>
      `;
      wishlistContainer.appendChild(div);
    });

    attachWishlistEvents(); // Add remove from wishlist functionality
  } catch (err) {
    console.error('Failed to fetch wishlist items:', err);
    wishlistContainer.innerHTML = `<p class="text-center text-red-500 col-span-full">Failed to load wishlist.</p>`;
  }
}

// Show modal on button click
wishlistBtn.addEventListener('click', async () => {
  if (!userId) { alert('Please login first.'); return; }
  await fetchWishlistItems();
  wishlistModal.classList.remove('hidden');
});

// Close modal
closeWishlistBtn.addEventListener('click', () => wishlistModal.classList.add('hidden'));

// Update badge immediately on page load
updateWishlistBadge();

// Optional: Update badge periodically (every 30 sec)
setInterval(updateWishlistBadge, 30000);

// Function to handle removing items from wishlist
function attachWishlistEvents() {
  document.querySelectorAll('.remove-wishlist').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.productId;
      try {
        const res = await fetch('https://narpavihoney.brandmindz.com/routes/auth/shop/wishlist.php?action=remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ user_id: userId, product_id: productId })
        });
        const data = await res.json();
        if (data.success) {
          await fetchWishlistItems();
          updateWishlistBadge();
        } else {
          alert(data.message || 'Failed to remove item');
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong');
      }
    });
  });
} 
});

