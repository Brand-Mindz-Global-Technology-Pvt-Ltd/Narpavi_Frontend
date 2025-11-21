document.addEventListener("DOMContentLoaded", () => {

    // 1. Get product_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        alert("Product ID is missing");
        return;
    }

    // API URLs
    const API_URL = `https://narpavihoney.brandmindz.com/routes/auth/shop/get_product.php?product_id=${productId}`;
    const RECOMMENDED_API = `https://narpavihoney.brandmindz.com/routes/auth/shop/get_products.php`;

    // 2. Fetch product
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                alert("Product not found");
                return;
            }

            const product = data.product;
            const categoryId = product.category_id;  // IMPORTANT

            // Load recommended products here
            loadRecommendedProducts(categoryId, productId);

            // ------------ SET BASIC INFO -------------
            document.getElementById("productName").textContent = product.name;
            document.getElementById("productDesc").textContent = product.description;

            // ------------ PRICE & STRIKE PRICE -------------
            let displayPrice = product.price;
            let strikePrice = product.strike_price || "";

            if (product.variations && product.variations.length > 0) {
                displayPrice = product.variations[0].amount;
                strikePrice = product.variations[0].strike_amount;
            }

            document.getElementById("productPrice").textContent = `₹${displayPrice}`;
            document.getElementById("productStrikePrice").textContent =
                strikePrice ? `₹${strikePrice}` : "";

            // ------------ WEIGHT (QUANTITY) -------------
            const weightBox = document.getElementById("weightBox");

            if (product.variations && product.variations.length > 0) {
                const qty = product.variations[0].quantity;
                let displayQty = "";

                if (parseInt(qty) >= 1000) {
                    displayQty = (qty / 1000) + " Kg";
                } else {
                    displayQty = qty + " g";
                }

                weightBox.textContent = displayQty;

            } else {
                weightBox.textContent = "N/A";
            }

            // ------------ PRODUCT DESCRIPTION LIST -------------
            const descList = document.getElementById("productDescriptionList");

            if (product.product_description && product.product_description.trim() !== "") {
                let points = product.product_description
                    .split(".")
                    .filter(p => p.trim() !== "");

                descList.innerHTML = "";

                points.forEach(point => {
                    const li = document.createElement("li");
                    li.textContent = point.trim();
                    descList.appendChild(li);
                });

            } else {
                descList.innerHTML = "<li>No description available</li>";
            }

            // ------------ IMAGES -------------
            const mainImage = document.getElementById("mainImage");
            const thumbnailContainer = document.getElementById("thumbnailContainer");

            const BASE_PATH = "https://narpavihoney.brandmindz.com/routes/uploads/products/";

            thumbnailContainer.innerHTML = "";

            if (product.images.length > 0) {
                mainImage.src = BASE_PATH + product.images[0];

                product.images.forEach(img => {
                    const thumb = document.createElement("img");
                    thumb.src = BASE_PATH + img;
                    thumb.className =
                        "w-20 h-20 rounded-lg border cursor-pointer object-cover hover:border-amber-500";

                    thumb.addEventListener("click", () => {
                        mainImage.src = BASE_PATH + img;
                    });

                    thumbnailContainer.appendChild(thumb);
                });

            } else {
                mainImage.src = "assets/images/no-image.jpg";
            }

        })
        .catch(err => console.error("Error fetching product:", err));



    // ------------------------------------------------------------------
    // FUNCTION TO LOAD RECOMMENDED PRODUCTS
    // ------------------------------------------------------------------
// ------------------------------------------------------------------
// FUNCTION TO LOAD RECOMMENDED PRODUCTS
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// FUNCTION TO LOAD RECOMMENDED PRODUCTS (product.js style)
// ------------------------------------------------------------------
function loadRecommendedProducts() {
    const recommendedContainer = document.getElementById("recommendedProducts");

    fetch(`https://narpavihoney.brandmindz.com/routes/auth/shop/get_products.php`)
        .then(res => res.json())
        .then(resp => {
            if (!resp.success || !resp.products || resp.products.length === 0) {
                recommendedContainer.innerHTML = "<p>No recommended products found.</p>";
                return;
            }

            // Show first 4 products
            const recommended = resp.products.slice(0, 4);

            recommendedContainer.innerHTML = "";

            recommended.forEach(product => {
                // Use full URL from API or fallback
                let imgSrc = "assets/images/no-image.jpg";
                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                    imgSrc = product.images[0];
                }

                const card = document.createElement("div");
                card.className = "relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 product-card cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-3";

                card.innerHTML = `
                    <!-- Product Image -->
                    <img src="${imgSrc}" alt="${product.name}" class="w-full h-40 object-cover rounded-lg mb-2">

                    <!-- Product Name -->
                    <h4 class="text-sm font-semibold mt-2 text-gray-800">${product.name}</h4>

                    <!-- Price -->
                    <p class="text-amber-700 font-bold mt-1">₹${product.variations && product.variations.length > 0 ? product.variations[0].amount : product.price}</p>

                    <!-- Buttons -->
                    <div class="flex justify-center gap-2 mt-3">
                        <button class="shop-now-btn bg-[#8B4513] text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-[#A0522D] transition">
                            Shop Now
                        </button>
                        <button class="add-cart-btn border border-[#8B4513] text-[#8B4513] text-xs font-medium px-3 py-1.5 rounded hover:bg-[#8B4513] hover:text-white transition">
                            Add to Cart
                        </button>
                    </div>
                `;

                // Navigate to product detail on card click
                card.querySelector(".shop-now-btn").addEventListener("click", () => {
                    window.location.href = `product-details.html?id=${product.id}&category_id=${product.category_id}`;
                });

                recommendedContainer.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Recommended Products Error:", err);
            recommendedContainer.innerHTML = "<p>Error loading recommended products.</p>";
        });
}
});
