/**
 * Admin Dashboard Script - Complete Shop API Integration
 * Handles all admin operations: Products, Categories, Orders, Blogs
 */

const API_BASE = "https://narpavihoney.brandmindz.com/routes/auth/shop";

// Global variables
let currentUser = null;
let currentShop = null;
let categories = [];
let products = [];
let orders = [];
let blogs = [];

// Initialize admin dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeAdmin();
});

/**
 * Initialize admin dashboard
 */
async function initializeAdmin() {
  try {
    // Get current user from session
    if (window.sessionManager) {
      currentUser = window.sessionManager.getCurrentUser();
      if (!currentUser) {
        window.location.href = "login.html";
        return;
      }
    } else {
      // Fallback to localStorage if session manager not available
      const userId = localStorage.getItem("user_id");
      const userName = localStorage.getItem("user_name");
      const userRole = localStorage.getItem("user_role");

      if (!userId) {
        window.location.href = "login.html";
        return;
      }

      currentUser = {
        user_id: userId,
        user_name: userName,
        role: userRole || "admin",
      };
    }

    // Get shop ID from localStorage
    const shopId = localStorage.getItem("shop_id");
    if (!shopId) {
      console.error("No shop ID found");
      showToast("❌ Shop ID not found. Please login again.", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }
    currentShop = { id: shopId };

    console.log("✅ Current user:", currentUser);
    console.log("✅ Current shop:", currentShop);

    // Setup navigation
    console.log("🔧 Setting up navigation...");
    setupNavigation();

    // Load initial data
    console.log("📊 Loading dashboard...");
    await loadDashboard();

    // Setup forms
    console.log("📝 Setting up forms...");
    setupForms();

    // Initialize image upload slots
    console.log("🖼️ Setting up image upload slots...");
    initializeImageUploadSlots();

    console.log("✅ Admin dashboard initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize admin:", error);
  }
}

/**
 * Setup navigation
 */
function setupNavigation() {
  console.log("🔧 Setting up navigation...");

  // Desktop sidebar
  const sidebarLinks = document.querySelectorAll("#adminSidebar .nav-link");
  console.log("📋 Found sidebar links:", sidebarLinks.length);

  sidebarLinks.forEach((link, index) => {
    console.log(
      `🔗 Setting up link ${index + 1}:`,
      link.getAttribute("data-target")
    );
    link.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🖱️ Link clicked:", this.getAttribute("data-target"));
      handleNavigation(this);
    });
  });

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    console.log("📱 Setting up mobile sidebar toggle");
    sidebarToggle.addEventListener("click", function () {
      document.getElementById("adminSidebar").classList.toggle("show");
    });
  } else {
    console.log("⚠️ Mobile sidebar toggle not found");
  }

  console.log("✅ Navigation setup complete");
}

/**
 * Handle navigation
 */
function handleNavigation(link) {
  console.log("🔄 Navigation clicked:", link);

  // Remove active class from all links
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  link.classList.add("active");

  // Hide all sections
  document.querySelectorAll(".section").forEach((s) => {
    s.classList.add("d-none");
    console.log("📦 Hiding section:", s.id);
  });

  // Show target section
  const targetId = link.getAttribute("data-target");
  console.log("🎯 Target section:", targetId);

  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.remove("d-none");
    console.log("✅ Showing section:", targetId);
  } else {
    console.error("❌ Section not found:", targetId);
  }

  // Load section data
  switch (targetId) {
    case "dashboard":
      console.log("📊 Loading dashboard...");
      loadDashboard();
      break;
    case "categories":
      console.log("📁 Loading categories...");
      loadCategories();
      break;
    case "products":
      console.log("📦 Loading products...");
      loadProducts();
      break;
    case "orders":
      console.log("🛒 Loading orders...");
      loadOrders();
      break;
    case "blogs":
      console.log("📝 Loading blogs...");
      loadBlogs();
      break;
    default:
      console.log("❓ Unknown section:", targetId);
  }
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
  try {
    showLoading("dashboard");

    // Load all data in parallel
    const [productsRes, categoriesRes, ordersRes, blogsRes] = await Promise.all(
      [
        fetch(`${API_BASE}/get_my_products.php?shop_id=${currentShop.id}`),
        fetch(`${API_BASE}/get_categories.php?shop_id=${currentShop.id}`),
        fetch(`${API_BASE}/get_orders.php?shop_id=${currentShop.id}`), // Use shop_id for admin orders
        fetch(`${API_BASE}/get_blogs.php`),
      ]
    );

    const [productsData, categoriesData, ordersData, blogsData] =
      await Promise.all([
        productsRes.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse products response:", text);
            return { success: false, message: "Invalid response format" };
          }
        }),
        categoriesRes.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse categories response:", text);
            return { success: false, message: "Invalid response format" };
          }
        }),
        ordersRes.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse orders response:", text);
            return { success: false, message: "Invalid response format" };
          }
        }),
        blogsRes.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse blogs response:", text);
            return { success: false, message: "Invalid response format" };
          }
        }),
      ]);

    // Update dashboard cards
    document.getElementById("cardProducts").innerText = productsData.success
      ? productsData.products.length
      : 0;
    document.getElementById("cardCategories").innerText = categoriesData.success
      ? categoriesData.categories.length
      : 0;
    document.getElementById("cardOrders").innerText = ordersData.success
      ? ordersData.orders.length
      : 0;
    document.getElementById("cardBlogs").innerText = blogsData.success
      ? blogsData.blogs.length
      : 0;

    hideLoading("dashboard");
  } catch (error) {
    console.error("❌ Failed to load dashboard:", error);
    hideLoading("dashboard");
    showToast("❌ Failed to load dashboard data", "error");
  }
}

/**
 * Load categories
 */
async function loadCategories() {
  try {
    showLoading("categories");

    const response = await fetch(
      `${API_BASE}/get_categories.php?shop_id=${currentShop.id}`
    );
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse categories response:", responseText);
      data = { success: false, message: "Invalid response format" };
    }

    const list = document.getElementById("categoryList");
    list.innerHTML = "";

    if (data.success && data.categories.length > 0) {
      categories = data.categories;
      data.categories.forEach((cat) => {
        list.innerHTML += `
                    <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <div>
                            <h6 class="mb-1">${cat.name}</h6>
                            <small class="text-muted">Slug: ${cat.slug}</small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${cat.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${cat.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-folder fa-3x text-muted mb-3"></i>
                    <h5>No categories yet</h5>
                    <p class="text-muted">Add your first category to get started!</p>
                </div>
            `;
    }

    hideLoading("categories");
  } catch (error) {
    console.error("❌ Failed to load categories:", error);
    hideLoading("categories");
    showToast("❌ Failed to load categories", "error");
  }
}

/**
 * Load products
 */
async function loadProducts() {
  try {
    showLoading("products");

    // Load categories for dropdown
    await loadCategoriesForDropdown();

    // Load products
    const response = await fetch(
      `${API_BASE}/get_my_products.php?shop_id=${currentShop.id}`
    );
    const data = await response.json();

    const list = document.getElementById("productList");
    list.innerHTML = "";

    if (data.success && data.products.length > 0) {
      products = data.products;
      data.products.forEach((product) => {
        const statusBadge =
          product.status === "active" ? "success" : "secondary";
        const newArrivalBadge = product.is_new_arrival ? "warning" : "light";

        list.innerHTML += `
                    <div class="product-card">
                        <div class="product-card-content">
                            <div class="row align-items-center">
                                <div class="col-md-2">
                                    ${
                                      product.images &&
                                      product.images.length > 0
                                        ? createProductGallery(
                                            product.images,
                                            product.id
                                          )
                                        : `<div class="no-image-placeholder">
                                            <i class="fas fa-image"></i>
                                        </div>`
                                    }
                                </div>
                                <div class="col-md-6">
                                    <h6 class="product-name">${
                                      product.name
                                    }</h6>
                                    <p class="product-description">${
                                      product.description || "No description"
                                    }</p>
                                    <div class="product-badges">
                                        <span class="badge status-badge bg-${statusBadge}">${
          product.status
        }</span>
                                        ${
                                          product.is_new_arrival
                                            ? '<span class="badge new-arrival-badge">New Arrival</span>'
                                            : ""
                                        }
                                    </div>
                                    <small class="product-category">Category: ${
                                      product.category_name || "Uncategorized"
                                    }</small>
                                </div>
                                <div class="col-md-2 text-center">
                                    <h6 class="product-price">₹${
                                      product.price
                                    }</h6>
                                    <small class="product-stock">Stock: ${
                                      product.stock
                                    }</small>
                                </div>
                                <div class="col-md-2">
                                    <div class="product-actions">
                                        <button class="btn btn-edit" onclick="editProduct(${
                                          product.id
                                        })">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-delete" onclick="deleteProduct(${
                                          product.id
                                        })">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-box fa-3x text-muted mb-3"></i>
                    <h5>No products yet</h5>
                    <p class="text-muted">Add your first product to get started!</p>
                </div>
            `;
    }

    hideLoading("products");
  } catch (error) {
    console.error("❌ Failed to load products:", error);
    hideLoading("products");
    showToast("❌ Failed to load products", "error");
  }
}

/**
 * Load categories for dropdown
 */
async function loadCategoriesForDropdown() {
  try {
    const response = await fetch(
      `${API_BASE}/get_categories.php?shop_id=${currentShop.id}`
    );
    const data = await response.json();

    const select = document.getElementById("prodCategory");
    select.innerHTML = '<option value="">Select Category</option>';

    if (data.success && data.categories.length > 0) {
      data.categories.forEach((cat) => {
        select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
      });
    }
  } catch (error) {
    console.error("❌ Failed to load categories for dropdown:", error);
  }
}

/**
 * Load orders
 */
async function loadOrders() {
  try {
    showLoading("orders");

    const response = await fetch(
      `${API_BASE}/get_orders.php?shop_id=${currentShop.id}`
    );
    const data = await response.json();

    const list = document.getElementById("orderList");
    list.innerHTML = "";

    if (data.success && data.orders.length > 0) {
      orders = data.orders;
      data.orders.forEach((order) => {
        const statusBadge = getOrderStatusBadge(order.status);
        list.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-3">
                                    <h6 class="mb-1">Order #${
                                      order.order_id
                                    }</h6>
                                    <small class="text-muted">${new Date(
                                      order.created_at
                                    ).toLocaleDateString()}</small>
                                </div>
                                <div class="col-md-3">
                                    <p class="mb-1">Customer: ${
                                      order.customer_name || "N/A"
                                    }</p>
                                    <small class="text-muted">${
                                      order.customer_email || "N/A"
                                    }</small>
                                </div>
                                <div class="col-md-2 text-center">
                                    <h6 class="text-success mb-1">₹${
                                      order.total_amount
                                    }</h6>
                                    <small class="text-muted">${
                                      order.items_count
                                    } items</small>
                                </div>
                                <div class="col-md-2 text-center">
                                    <span class="badge bg-${statusBadge}">${
          order.status
        }</span>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-sm btn-outline-primary w-100" onclick="viewOrder(${
                                      order.order_id
                                    })">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5>No orders yet</h5>
                    <p class="text-muted">Orders will appear here when customers place them!</p>
                </div>
            `;
    }

    hideLoading("orders");
  } catch (error) {
    console.error("❌ Failed to load orders:", error);
    hideLoading("orders");
    showToast("❌ Failed to load orders", "error");
  }
}

/**
 * Load blogs
 */
async function loadBlogs() {
  try {
    showLoading("blogs");

    const response = await fetch(`${API_BASE}/get_blogs.php`);
    const data = await response.json();

    const list = document.getElementById("blogList");
    list.innerHTML = "";

    if (data.success && data.blogs.length > 0) {
      blogs = data.blogs;
      console.log("Blogs loaded:", blogs.length);
      if (blogs.length > 0) {
        console.log("Sample blog object:", blogs[0]);
        console.log("Blog keys:", Object.keys(blogs[0]));
      }
      data.blogs.forEach((blog) => {
        list.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-2">
                                    ${
                                      blog.image
                                        ? `<img src="https://narpavihoney.brandmindz.com/routes/auth/uploads/blogs/${blog.image}" 
                                              class="img-fluid rounded" style="height: 80px; object-fit: cover;">`
                                        : `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 80px;">
                                            <i class="fas fa-image text-muted"></i>
                                        </div>`
                                    }
                                </div>
                                <div class="col-md-8">
                                    <h6 class="mb-1">${blog.title}</h6>
                                    <div class="text-muted mb-1" style="max-height: 60px; overflow: hidden;">
                                        ${
                                          blog.content && blog.content.trim()
                                            ? (() => {
                                                // Strip HTML tags and get plain text
                                                const plainText = blog.content.replace(/<[^>]*>/g, '');
                                                const truncated = plainText.substring(0, 150);
                                                return truncated + (plainText.length > 150 ? "..." : "");
                                              })()
                                            : "<em class='text-muted'>No content available</em>"
                                        }
                                    </div>
                                    <small class="text-muted">
                                        <strong>Slug:</strong> ${blog.slug} | 
                                        <strong>Created:</strong> ${new Date(blog.created_at || blog.createdAt || Date.now()).toLocaleDateString()}
                                    </small>
                                </div>
                                <div class="col-md-2">
                                    <div class="btn-group-vertical w-100">
                                        <button class="btn btn-sm btn-outline-primary" onclick="editBlog(${
                                          blog.id
                                        })">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteBlog(${
                                          blog.id
                                        })">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-blog fa-3x text-muted mb-3"></i>
                    <h5>No blogs yet</h5>
                    <p class="text-muted">Add your first blog post to get started!</p>
                </div>
            `;
    }

    hideLoading("blogs");
  } catch (error) {
    console.error("❌ Failed to load blogs:", error);
    hideLoading("blogs");
    showToast("❌ Failed to load blogs", "error");
  }
}

/**
 * Setup forms
 */
function setupForms() {
  // Category form
  const categoryForm = document.getElementById("categoryForm");
  if (categoryForm) {
    categoryForm.addEventListener("submit", handleCategorySubmit);
    // Additional prevention
    categoryForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }

  // Product form
  const productForm = document.getElementById("productForm");
  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit);
    // Additional prevention
    productForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }

  // Initialize price variations
  initializePriceVariations();

  // Product save button
  const productSaveBtn = document.getElementById('productSaveBtn');
  if (productSaveBtn) {
    productSaveBtn.addEventListener('click', handleProductSave);
  }

  // Product cancel button
  const productCancelBtn = document.getElementById('productCancelBtn');
  if (productCancelBtn) {
    productCancelBtn.addEventListener('click', handleProductCancel);
  }

  // Blog form
  const blogForm = document.getElementById("blogForm");
  if (blogForm) {
    blogForm.addEventListener("submit", handleBlogSubmit);
    // Additional prevention
    blogForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }
}

/**
 * Handle category form submission
 */
async function handleCategorySubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log("Category form submitted, preventing default behavior");

  const formData = new FormData(e.target);
  formData.append("shop_id", currentShop.id);

  try {
    showLoading("categories");

    const response = await fetch(`${API_BASE}/add_category.php`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    hideLoading("categories");

    if (data.success) {
      showToast("✅ Category added successfully!", "success");
      e.target.reset();
      loadCategories();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error("❌ Failed to add category:", error);
    hideLoading("categories");
    showToast("❌ Failed to add category", "error");
  }

  return false; // Additional prevention
}

/**
 * Handle product form submission
 */
async function handleProductSubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  const formData = new FormData(e.target);
  formData.append("shop_id", currentShop.id);

  // Collect price variations
  const variations = collectPriceVariations();
  formData.append("variations", JSON.stringify(variations));

  // Collect image files from upload slots
  const imageFiles = getImageFiles();
  imageFiles.forEach((file, index) => {
    formData.append(`images[${index}]`, file);
  });

  try {
    showLoading("products");

    const response = await fetch(`${API_BASE}/add_product.php`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    hideLoading("products");

    if (data.success) {
      showToast("✅ Product added successfully!", "success");
      e.target.reset();
      resetPriceVariations();
      initializeImageUploadSlots(); // Reset image slots
      loadProducts();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error("❌ Failed to add product:", error);
    hideLoading("products");
    showToast("❌ Failed to add product", "error");
  }

  return false; // Additional prevention
}

/**
 * Handle blog form submission
 */
async function handleBlogSubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log("Blog form submitted, preventing default behavior");

  const formData = new FormData(e.target);

  try {
    showLoading("blogs");

    const response = await fetch(`${API_BASE}/add_blog.php`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    hideLoading("blogs");

    if (data.success) {
      showToast("✅ Blog added successfully!", "success");
      e.target.reset();
      loadBlogs();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error("❌ Failed to add blog:", error);
    hideLoading("blogs");
    showToast("❌ Failed to add blog", "error");
  }

  return false; // Additional prevention
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
  showPopup(
    "Delete Product",
    "Are you sure you want to delete this product? This action cannot be undone.",
    "warning",
    async () => {
      try {
        const formData = new FormData();
        formData.append("product_id", productId);

        const response = await fetch(`${API_BASE}/delete_product.php`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          showToast("✅ Product deleted successfully!", "success");
          loadProducts();
        } else {
          showToast("❌ " + data.message, "error");
        }
      } catch (error) {
        console.error("❌ Failed to delete product:", error);
        showToast("❌ Failed to delete product", "error");
      }
    }
  );
}

/**
 * Edit product
 */
async function editProduct(productId) {
  const product = products.find((p) => p.id == productId);
  if (!product) {
    showToast("❌ Product not found", "error");
    return;
  }

  // Load categories for dropdown first
  await loadCategoriesForDropdown();

  // Fill form with product data
  document.getElementById("prodId").value = product.id;
  document.getElementById("prodName").value = product.name;
  document.getElementById("prodSlug").value = product.slug;
  document.getElementById("prodDesc").value = product.description || "";
  document.getElementById("prodProductDesc").value = product.product_description || "";
  document.getElementById("prodBenefits").value = product.benefits || "";
  document.getElementById("prodHowToUse").value = product.how_to_use || "";
  document.getElementById("prodPrice").value = product.price;
  document.getElementById("prodStock").value = product.stock;

  // Set category value - ensure it's set after dropdown is populated
  const setCategoryValue = () => {
    const categorySelect = document.getElementById("prodCategory");

    // Try different possible field names for category ID
    let categoryId =
      product.category_id ||
      product.categoryId ||
      product.cat_id ||
      product.catId;

    // Check if category_id exists and is valid
    if (!categoryId || categoryId === null || categoryId === undefined) {
      return;
    }

    const targetValue = categoryId.toString();

    // Check if the target category exists in the dropdown
    const optionExists = Array.from(categorySelect.options).some(
      (option) => option.value === targetValue
    );

    if (optionExists) {
      categorySelect.value = targetValue;
    } else {
    }
  };

  // Try to set immediately, then with a small delay as fallback
  setCategoryValue();
  setTimeout(setCategoryValue, 50);

  document.getElementById("prodStatus").value = product.status || "active";
  document.getElementById("prodNew").checked = product.is_new_arrival == 1;

  // Load price variations (always call loadPriceVariations, it handles empty arrays)
  loadPriceVariations(product.variations || []);

  // Load existing images into upload slots
  if (product.images && product.images.length > 0) {
    loadImagesForEdit(product.images);
  } else {
    // Clear all slots if no images
    initializeImageUploadSlots();
  }

  // Switch to edit mode
  switchToEditMode("product");

  // Scroll to form
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });

  showToast("📝 Product data loaded for editing", "info");
}

/**
 * Edit category
 */
function editCategory(categoryId) {
  const category = categories.find((c) => c.id == categoryId);
  if (!category) {
    showToast("❌ Category not found", "error");
    return;
  }

  // Fill form with category data
  document.getElementById("catId").value = category.id;
  document.getElementById("catName").value = category.name;
  document.getElementById("catSlug").value = category.slug;

  // Switch to edit mode
  switchToEditMode("category");

  // Scroll to form
  document.getElementById("categories").scrollIntoView({ behavior: "smooth" });

  showToast("📝 Category data loaded for editing", "info");
}

/**
 * Edit blog
 */
function editBlog(blogId) {
  const blog = blogs.find((b) => b.id == blogId);
  if (!blog) {
    showToast("❌ Blog not found", "error");
    return;
  }

  // Fill form with blog data
  document.getElementById("blogId").value = blog.id;
  document.getElementById("blogTitle").value = blog.title;
  document.getElementById("blogSlug").value = blog.slug;
  document.getElementById("blogContent").value = blog.content || "";

  // Switch to edit mode
  switchToEditMode("blog");

  // Scroll to form
  document.getElementById("blogs").scrollIntoView({ behavior: "smooth" });

  showToast("📝 Blog data loaded for editing", "info");
}

/**
 * Switch to edit mode
 */
function switchToEditMode(type) {
  const formTitle = document.getElementById(`${type}FormTitle`);
  const submitBtn = document.getElementById(`${type}SubmitBtn`);
  const editControls = document.getElementById(`${type}EditControls`);

  // Update form title
  formTitle.innerHTML = `<i class="fas fa-edit text-warning me-2"></i>Edit ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;

  // Hide submit button and show edit controls
  submitBtn.style.display = "none";
  editControls.style.display = "block";

  // Add event listeners for save and cancel
  setupEditControls(type);
}

/**
 * Switch back to add mode
 */
function switchToAddMode(type) {
  const formTitle = document.getElementById(`${type}FormTitle`);
  const submitBtn = document.getElementById(`${type}SubmitBtn`);
  const editControls = document.getElementById(`${type}EditControls`);
  const form = document.getElementById(`${type}Form`);

  // Update form title
  formTitle.innerHTML = `<i class="fas fa-plus-circle text-primary me-2"></i>Add New ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;

  // Show submit button and hide edit controls
  submitBtn.style.display = "inline-block";
  editControls.style.display = "none";

  // Reset form
  form.reset();

  // Get the correct ID field name based on type
  let idFieldName;
  switch (type) {
    case "product":
      idFieldName = "prodId";
      break;
    case "category":
      idFieldName = "catId";
      break;
    case "blog":
      idFieldName = "blogId";
      break;
    default:
      idFieldName = `${type}Id`;
  }

  document.getElementById(idFieldName).value = "";
}

/**
 * Setup edit controls
 */
function setupEditControls(type) {
  const saveBtn = document.getElementById(`${type}SaveBtn`);
  const cancelBtn = document.getElementById(`${type}CancelBtn`);

  // Remove existing event listeners
  saveBtn.replaceWith(saveBtn.cloneNode(true));
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));

  // Add new event listeners
  document.getElementById(`${type}SaveBtn`).onclick = () => saveEdit(type);
  document.getElementById(`${type}CancelBtn`).onclick = () =>
    switchToAddMode(type);
}

/**
 * Save edit
 */
async function saveEdit(type) {
  const form = document.getElementById(`${type}Form`);
  const formData = new FormData(form);

  // Get the correct ID field name based on type
  let idFieldName;
  switch (type) {
    case "product":
      idFieldName = "prodId";
      break;
    case "category":
      idFieldName = "catId";
      break;
    case "blog":
      idFieldName = "blogId";
      break;
    default:
      idFieldName = `${type}Id`;
  }

  const id = document.getElementById(idFieldName).value;

  console.log(`Saving edit for ${type}, ID: ${id}`);

  if (!id) {
    showToast("❌ No item selected for editing", "error");
    return;
  }

  try {
    showLoading(type);

    // Add edit flag to form data
    formData.append("edit", "1");
    formData.append("id", id);

    // Add shop_id for category and product
    if (type === "category" || type === "product") {
      formData.append("shop_id", currentShop.id);
    }

    // For products, collect price variations and images
    if (type === "product") {
      console.log('About to collect price variations...');
      const variations = collectPriceVariations();
      console.log('Collected variations:', variations);
      const variationsJson = JSON.stringify(variations);
      console.log('Sending variations JSON:', variationsJson);
      formData.append('variations', variationsJson);

      // Collect image files from upload slots
      const imageFiles = getImageFiles();
      console.log('Collected image files:', imageFiles.length);
      imageFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
    }

    let endpoint = "";
    switch (type) {
      case "category":
        endpoint = `${API_BASE}/add_category.php`;
        break;
      case "product":
        endpoint = `${API_BASE}/edit_product.php`;
        break;
      case "blog":
        endpoint = `${API_BASE}/add_blog.php`;
        break;
    }

    console.log(`Sending request to: ${endpoint}`);
    
    // Log form data after all fields are added
    console.log("Form data:", Object.fromEntries(formData));
    console.log("Form data entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value} (type: ${typeof value})`);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      console.log("Response was not valid JSON. Raw response:", responseText);
      hideLoading(type);
      showToast("❌ Server returned invalid response", "error");
      return;
    }

    hideLoading(type);

    if (data.success) {
      showToast(
        `✅ ${
          type.charAt(0).toUpperCase() + type.slice(1)
        } updated successfully!`,
        "success"
      );
      switchToAddMode(type);

      // Reload the appropriate list
      switch (type) {
        case "category":
          loadCategories();
          break;
        case "product":
          loadProducts();
          break;
        case "blog":
          loadBlogs();
          break;
      }
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error(`❌ Failed to update ${type}:`, error);
    hideLoading(type);
    showToast(`❌ Failed to update ${type}`, "error");
  }
}

/**
 * Delete category
 */
async function deleteCategory(categoryId) {
  showPopup(
    "Delete Category",
    "Are you sure you want to delete this category?",
    "warning",
    async () => {
      try {
        const formData = new FormData();
        formData.append("delete", "1");
        formData.append("id", categoryId);

        const response = await fetch(`${API_BASE}/add_category.php`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          showToast("✅ Category deleted successfully!", "success");
          loadCategories();
        } else {
          showToast("❌ " + data.message, "error");
        }
      } catch (error) {
        console.error("❌ Failed to delete category:", error);
        showToast("❌ Failed to delete category", "error");
      }
    }
  );
}

/**
 * View order
 */
function viewOrder(orderId) {
  showToast("📋 Order details view not implemented yet", "info");
}

/**
 * Delete blog
 */
async function deleteBlog(blogId) {
  showPopup(
    "Delete Blog",
    "Are you sure you want to delete this blog post? This action cannot be undone.",
    "warning",
    async () => {
      try {
        const formData = new FormData();
        formData.append("delete", "1");
        formData.append("id", blogId);

        const response = await fetch(`${API_BASE}/add_blog.php`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          showToast("✅ Blog deleted successfully!", "success");
          loadBlogs();
        } else {
          showToast("❌ " + data.message, "error");
        }
      } catch (error) {
        console.error("❌ Failed to delete blog:", error);
        showToast("❌ Failed to delete blog", "error");
      }
    }
  );
}

/**
 * Get order status badge color
 */
function getOrderStatusBadge(status) {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
}

/**
 * Show loading state
 */
function showLoading(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = `${sectionId}-loading`;
    loadingDiv.className = "text-center p-4";
    loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading...</p>
        `;
    section.appendChild(loadingDiv);
  }
}

/**
 * Hide loading state
 */
function hideLoading(sectionId) {
  const loadingDiv = document.getElementById(`${sectionId}-loading`);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

/**
 * Create product image gallery
 */
function createProductGallery(images, productId) {
  console.log("Creating gallery for product:", productId, "Images:", images);

  if (!images || images.length === 0) {
    console.log("No images found for product:", productId);
    return `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 80px;">
                    <i class="fas fa-image text-muted"></i>
                </div>`;
  }

  // If only one image, show as normal single photo
  if (images.length === 1) {
    const imageUrl = `https://narpavihoney.brandmindz.com/routes/uploads/products/${images[0]}`;
    console.log("Single image URL:", imageUrl);
    return `<div class="single-image-container" onclick="openImageModal(${productId}, 0)">
                    <img src="${imageUrl}" 
                         class="single-product-image" 
                         alt="Product Image"
                         onload="console.log('Image loaded successfully:', this.src)"
                         onerror="console.log('Image failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-error-fallback" style="display: none;">
                        <i class="fas fa-image"></i>
                    </div>
                </div>`;
  }

  // Multiple images - show as gallery
  const maxDisplay = 4; // Show max 4 thumbnails
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  let galleryHTML = '<div class="product-gallery">';

  displayImages.forEach((image, index) => {
    const imageUrl = `https://narpavihoney.brandmindz.com/routes/uploads/products/${image}`;
    galleryHTML += `
            <div class="gallery-thumbnail" onclick="openImageModal(${productId}, ${index})">
                <img src="${imageUrl}" alt="Product Image ${index + 1}">
                <div class="gallery-overlay">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
        `;
  });

  // Add count badge if there are more than 4 images
  if (remainingCount > 0) {
    galleryHTML += `
            <div class="gallery-thumbnail" onclick="openImageModal(${productId}, ${maxDisplay})">
                <div class="bg-light d-flex align-items-center justify-content-center" style="height: 100%;">
                    <span class="text-muted">+${remainingCount}</span>
                </div>
                <div class="gallery-count">${images.length}</div>
            </div>
        `;
  }

  galleryHTML += "</div>";
  return galleryHTML;
}

/**
 * Open image modal
 */
function openImageModal(productId, startIndex = 0) {
  const product = products.find((p) => p.id == productId);
  if (!product || !product.images || product.images.length === 0) {
    showToast("❌ No images found for this product", "error");
    return;
  }

  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("imageModalImg");
  const modalCounter = document.getElementById("imageModalCounter");
  const prevBtn = document.getElementById("imageModalPrev");
  const nextBtn = document.getElementById("imageModalNext");

  let currentIndex = startIndex;
  const totalImages = product.images.length;

  function updateModal() {
    const imageUrl = `https://narpavihoney.brandmindz.com/routes/uploads/products/${product.images[currentIndex]}`;
    modalImg.src = imageUrl;
    modalImg.alt = `Product Image ${currentIndex + 1}`;
    modalCounter.textContent = `${currentIndex + 1} / ${totalImages}`;

    // Show/hide navigation buttons
    prevBtn.style.display = totalImages > 1 ? "flex" : "none";
    nextBtn.style.display = totalImages > 1 ? "flex" : "none";
  }

  // Navigation functions
  function showPrev() {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    updateModal();
  }

  function showNext() {
    currentIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    updateModal();
  }

  // Event listeners
  prevBtn.onclick = showPrev;
  nextBtn.onclick = showNext;

  // Keyboard navigation
  const handleKeydown = (e) => {
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "Escape") closeImageModal();
  };

  document.addEventListener("keydown", handleKeydown);

  // Close modal
  const closeModal = () => {
    modal.classList.remove("show");
    document.removeEventListener("keydown", handleKeydown);
  };

  document.getElementById("imageModalClose").onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Initialize and show modal
  updateModal();
  modal.classList.add("show");
}

/**
 * Close image modal
 */
function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.classList.remove("show");
}

/**
 * Show popup modal
 */
function showPopup(title, message, type = "info", callback = null) {
  const modal = document.getElementById("popupModal");
  const titleEl = document.getElementById("popupTitle");
  const messageEl = document.getElementById("popupMessage");
  const iconEl = document.getElementById("popupIcon");
  const okBtn = document.getElementById("popupOk");
  const closeBtn = document.getElementById("popupClose");

  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;

  // Set icon and colors based on type
  const iconMap = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };

  iconEl.className = `popup-icon ${type}`;
  iconEl.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i>`;

  // Show modal
  modal.classList.add("show");

  // Close handlers
  const closeModal = () => {
    modal.classList.remove("show");
    if (callback) callback();
  };

  okBtn.onclick = closeModal;
  closeBtn.onclick = closeModal;

  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
    toastContainer.style.zIndex = "1055";
    document.body.appendChild(toastContainer);
  }

  // Create toast
  const toastId = "toast-" + Date.now();
  const toast = document.createElement("div");
  toast.id = toastId;
  toast.className = `toast align-items-center text-white bg-${
    type === "error"
      ? "danger"
      : type === "success"
      ? "success"
      : type === "warning"
      ? "warning"
      : "info"
  } border-0`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

  toastContainer.appendChild(toast);

  // Show toast
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();

  // Remove toast after it's hidden
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}

/**
 * Handle product save (edit mode)
 */
async function handleProductSave() {
  const productId = document.getElementById('prodId').value;
  if (!productId) {
    showToast('❌ No product selected for editing', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('id', productId);
  formData.append('name', document.getElementById('prodName').value);
  formData.append('slug', document.getElementById('prodSlug').value);
  formData.append('description', document.getElementById('prodDesc').value);
  formData.append('product_description', document.getElementById('prodProductDesc').value);
  formData.append('benefits', document.getElementById('prodBenefits').value);
  formData.append('how_to_use', document.getElementById('prodHowToUse').value);
  formData.append('price', document.getElementById('prodPrice').value);
  formData.append('stock', document.getElementById('prodStock').value);
  formData.append('category_id', document.getElementById('prodCategory').value);
  formData.append('status', document.getElementById('prodStatus').value);
  formData.append('is_new_arrival', document.getElementById('prodNew').checked ? '1' : '0');

  try {
    showLoading('products');

    const response = await fetch(`${API_BASE}/edit_product.php`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    hideLoading('products');

    if (data.success) {
      showToast('✅ Product updated successfully!', 'success');
      switchToAddMode('product');
      resetPriceVariations();
      loadProducts();
    } else {
      showToast('❌ ' + data.message, 'error');
    }
  } catch (error) {
    console.error('❌ Failed to update product:', error);
    hideLoading('products');
    showToast('❌ Failed to update product', 'error');
  }
}

/**
 * Handle product cancel (edit mode)
 */
function handleProductCancel() {
  switchToAddMode('product');
  resetPriceVariations();
  showToast('📝 Edit cancelled', 'info');
}

/**
 * Price Variations Management
 */

// Initialize price variations functionality
function initializePriceVariations() {
  // Add variation button
  const addVariationBtn = document.getElementById('addVariation');
  if (addVariationBtn) {
    addVariationBtn.addEventListener('click', addPriceVariation);
  }

  // Remove variation buttons (delegated event handling)
  document.addEventListener('click', function(e) {
    if (e.target.closest('.remove-variation')) {
      e.target.closest('.variation-row').remove();
    }
  });
}

// Add new price variation row
function addPriceVariation() {
  const variationsContainer = document.getElementById('priceVariations');
  const newRow = document.createElement('div');
  newRow.className = 'variation-row row g-2 mb-2';
  newRow.innerHTML = `
    <div class="col-md-3">
      <input type="text" class="form-control variation-quantity" placeholder="e.g., 500g">
    </div>
    <div class="col-md-3">
      <input type="number" class="form-control variation-price" placeholder="Price" step="0.01" min="0">
    </div>
    <div class="col-md-3">
      <input type="number" class="form-control variation-strike-price" placeholder="Strike Price" step="0.01" min="0">
    </div>
    <div class="col-md-3">
      <button type="button" class="btn btn-outline-danger btn-sm remove-variation">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  variationsContainer.appendChild(newRow);
}

// Collect all price variations from the form
function collectPriceVariations() {
  const variations = [];
  const variationRows = document.querySelectorAll('.variation-row');
  
  console.log('Collecting variations from', variationRows.length, 'rows');
  console.log('Variation rows found:', variationRows);
  
  variationRows.forEach((row, index) => {
    const quantityInput = row.querySelector('.variation-quantity');
    const priceInput = row.querySelector('.variation-price');
    const strikePriceInput = row.querySelector('.variation-strike-price');
    
    if (!quantityInput || !priceInput) {
      console.log('Missing required inputs in row', index);
      return;
    }
    
    const quantity = quantityInput.value.trim();
    const price = parseFloat(priceInput.value);
    const strikePrice = strikePriceInput ? parseFloat(strikePriceInput.value) : null;
    
    console.log('Row', index, ':', { quantity, price, strikePrice });
    
    if (quantity && !isNaN(price) && price > 0) {
      const variation = {
        quantity: quantity,
        amount: price
      };
      
      // Only add strike_amount if it's a valid number and greater than 0
      if (strikePrice && !isNaN(strikePrice) && strikePrice > 0) {
        variation.strike_amount = strikePrice;
      }
      
      variations.push(variation);
      console.log('Added variation:', variation);
    } else {
      console.log('Skipping row', index, 'due to invalid data');
    }
  });
  
  console.log('Final variations array:', variations);
  return variations;
}

// Reset price variations to default state
function resetPriceVariations() {
  const variationsContainer = document.getElementById('priceVariations');
  variationsContainer.innerHTML = `
    <div class="variation-row row g-2 mb-2">
      <div class="col-md-3">
        <input type="text" class="form-control variation-quantity" placeholder="e.g., 500g">
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control variation-price" placeholder="Price" step="0.01" min="0">
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control variation-strike-price" placeholder="Strike Price" step="0.01" min="0">
      </div>
      <div class="col-md-3">
        <button type="button" class="btn btn-outline-danger btn-sm remove-variation">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// Image Upload Slots Functions
function initializeImageUploadSlots() {
  const slotsContainer = document.getElementById('imageUploadSlots');
  if (!slotsContainer) return;

  // Create 4 image upload slots
  slotsContainer.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const slot = createImageUploadSlot(i);
    slotsContainer.appendChild(slot);
  }
}

function createImageUploadSlot(index) {
  const col = document.createElement('div');
  col.className = 'col-md-3 col-sm-6';
  
  col.innerHTML = `
    <div class="image-upload-slot" data-slot-index="${index}">
      <div class="image-preview-container">
        <img class="image-preview" src="" alt="Preview" style="display: none;">
        <div class="image-placeholder">
          <i class="fas fa-camera"></i>
          <span>Click to upload</span>
        </div>
      </div>
      <input type="file" class="image-input" accept="image/*" style="display: none;">
      <div class="image-actions" style="display: none;">
        <button type="button" class="btn btn-sm btn-outline-primary change-image">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger remove-image">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  const slot = col.querySelector('.image-upload-slot');
  const input = col.querySelector('.image-input');
  const preview = col.querySelector('.image-preview');
  const placeholder = col.querySelector('.image-placeholder');
  const actions = col.querySelector('.image-actions');
  const changeBtn = col.querySelector('.change-image');
  const removeBtn = col.querySelector('.remove-image');

  // Click to upload
  slot.addEventListener('click', (e) => {
    if (!e.target.closest('.image-actions')) {
      input.click();
    }
  });

  // File input change
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (validateImageFile(file)) {
        displayImagePreview(file, preview, placeholder, actions);
      } else {
        showToast('❌ Please select a valid image file (JPG, PNG, GIF)', 'error');
        input.value = '';
      }
    }
  });

  // Change image button
  changeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    input.click();
  });

  // Remove image button
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeImageFromSlot(slot, input, preview, placeholder, actions);
  });

  return col;
}

function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    showToast('❌ Image size should be less than 5MB', 'error');
    return false;
  }

  return true;
}

function displayImagePreview(file, preview, placeholder, actions) {
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    actions.style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function removeImageFromSlot(slot, input, preview, placeholder, actions) {
  input.value = '';
  preview.src = '';
  preview.style.display = 'none';
  placeholder.style.display = 'flex';
  actions.style.display = 'none';
}

function getImageFiles() {
  const slots = document.querySelectorAll('.image-upload-slot');
  const files = [];
  
  slots.forEach(slot => {
    const input = slot.querySelector('.image-input');
    if (input.files[0]) {
      files.push(input.files[0]);
    }
  });
  
  return files;
}

function loadImagesForEdit(images) {
  const slots = document.querySelectorAll('.image-upload-slot');
  
  // Clear all slots first
  slots.forEach(slot => {
    const input = slot.querySelector('.image-input');
    const preview = slot.querySelector('.image-preview');
    const placeholder = slot.querySelector('.image-placeholder');
    const actions = slot.querySelector('.image-actions');
    removeImageFromSlot(slot, input, preview, placeholder, actions);
  });
  
  // Load existing images
  if (images && images.length > 0) {
    images.forEach((imagePath, index) => {
      if (index < 4 && slots[index]) {
        const slot = slots[index];
        const preview = slot.querySelector('.image-preview');
        const placeholder = slot.querySelector('.image-placeholder');
        const actions = slot.querySelector('.image-actions');
        
        // Display existing image
        preview.src = `https://narpavihoney.brandmindz.com/routes/uploads/products/${imagePath}`;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        actions.style.display = 'flex';
        
        // Store the original image path for reference
        slot.dataset.originalImage = imagePath;
      }
    });
  }
}

// Load price variations for editing
function loadPriceVariations(variations) {
  // Handle case where variations might be a string
  if (typeof variations === 'string') {
    try {
      variations = JSON.parse(variations);
    } catch (e) {
      console.error("Failed to parse variations string:", e);
      resetPriceVariations();
      return;
    }
  }
  
  if (!variations || !Array.isArray(variations) || variations.length === 0) {
    // Show one empty row for adding variations
    const variationsContainer = document.getElementById('priceVariations');
    variationsContainer.innerHTML = `
      <div class="variation-row row g-2 mb-2">
        <div class="col-md-3">
          <input type="text" class="form-control variation-quantity" placeholder="e.g., 500g">
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control variation-price" placeholder="Price" step="0.01" min="0">
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control variation-strike-price" placeholder="Strike Price" step="0.01" min="0">
        </div>
        <div class="col-md-3">
          <button type="button" class="btn btn-outline-danger btn-sm remove-variation">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  const variationsContainer = document.getElementById('priceVariations');
  variationsContainer.innerHTML = '';
  
  variations.forEach((variation, index) => {
    const newRow = document.createElement('div');
    newRow.className = 'variation-row row g-2 mb-2';
    newRow.innerHTML = `
      <div class="col-md-3">
        <input type="text" class="form-control variation-quantity" placeholder="e.g., 500g" value="${variation.quantity || ''}" required>
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control variation-price" placeholder="Price" step="0.01" min="0" value="${variation.amount || ''}" required>
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control variation-strike-price" placeholder="Strike Price" step="0.01" min="0" value="${variation.strike_amount || ''}">
      </div>
      <div class="col-md-3">
        <button type="button" class="btn btn-outline-danger btn-sm remove-variation">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    variationsContainer.appendChild(newRow);
  });
}
