document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".product-container");

  fetch("https://narpavihoney.brandmindz.com/routes/auth/shop/get_products.php")
    .then((res) => res.json())
    .then((result) => {
      const products = result.products;
      container.innerHTML = "";

      products.forEach((product) => {
        const productCard = `
          <a href="product-details.html?id=${product.id}" class="block">
            <div
              class="relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 product-card cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >

              <!-- Wishlist Icon -->
              <button
                class="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.8"
                  stroke="#8B4513"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.015-4.5-4.5-4.5-1.74 0-3.255.99-4 2.445A4.498 4.498 0 008.5 3.75 4.5 4.5 0 004 8.25c0 7.22 8 11.25 8 11.25s8-4.03 8-11.25z"
                  />
                </svg>
              </button>

              <!-- Product Image -->
             <img
  src="${
    product.images && product.images.length > 0
      ? product.images[0]
      : "assets/images/no-image.jpg"
  }"
  alt="${product.name}"
  class="w-full h-52 object-cover"
/>


              <!-- Product Details -->
              <div class="p-4 text-center">
                <h2 class="font-semibold text-gray-800 text-lg">
                  ${product.name}
                </h2>

                <div class="mt-2">
                  <span class="text-[#8B4513] font-semibold text-base">
                    Rs. ${product.price}
                  </span>
                </div>

                <!-- Ratings -->
                <div class="flex justify-center items-center mt-1 text-yellow-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049.316l2.225 6.859h7.207l-5.832 4.242 2.225 6.859L9.05 14.034 3.225 18.276l2.225-6.859L-.382 7.175h7.207z"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049.316l2.225 6.859h7.207l-5.832 4.242 2.225 6.859L9.05 14.034 3.225 18.276l2.225-6.859L-.382 7.175h7.207z"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049.316l2.225 6.859h7.207l-5.832 4.242 2.225 6.859L9.05 14.034 3.225 18.276l2.225-6.859L-.382 7.175h7.207z"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049.316l2.225 6.859h7.207l-5.832 4.242 2.225 6.859L9.05 14.034 3.225 18.276l2.225-6.859L-.382 7.175h7.207z"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-current text-gray-300" viewBox="0 0 20 20"><path d="M9.049.316l2.225 6.859h7.207l-5.832 4.242 2.225 6.859L9.05 14.034 3.225 18.276l2.225-6.859L-.382 7.175h7.207z"/></svg>
                </div>

                <div class="flex justify-center gap-2 mt-3">
                  <button class="shop-now-btn bg-[#8B4513] text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-[#A0522D] transition">
                    Shop Now
                  </button>
                  <button class="add-cart-btn border border-[#8B4513] text-[#8B4513] text-xs font-medium px-3 py-1.5 rounded hover:bg-[#8B4513] hover:text-white transition">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </a>
        `;

        container.innerHTML += productCard;
      });
    })
    .catch((err) => console.error("Error fetching products:", err));
});
