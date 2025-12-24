
export const DEMO_BROKEN_HTML = `<!-- DEMO MODE: ACCESSIBILITYOS -->
<div class="product-card">
    <img src="sneaker.jpg" />
    <h3>Super Air Jordans</h3>
    <p>Price: $199</p>
    <div onclick="addToCart()" class="btn">Add to Cart</div>
    <a href="#">Read details</a>
</div>`

export const DEMO_PARTIAL_FIXED_HTML = `<!-- DEMO MODE: ACCESSIBILITYOS -->
<div class="product-card">
    <!-- HEALER FIX: Added alt text -->
    <img src="sneaker.jpg" alt="Pair of Super Air Jordan sneakers in red and white" />
    <h3>Super Air Jordans</h3>
    <p>Price: $199</p>
    <!-- HEALER FIX: ISSUE LEFT - Still a div, not a button (Navigator will find this) -->
    <div onclick="addToCart()" class="btn" role="button" tabindex="0">Add to Cart</div>
    <!-- HEALER FIX: Improved link text -->
    <a href="#">Read product details</a>
</div>`

export const DEMO_FULLY_FIXED_HTML = `<!-- DEMO MODE: ACCESSIBILITYOS -->
<div class="product-card">
    <img src="sneaker.jpg" alt="Pair of Super Air Jordan sneakers in red and white" />
    <h3>Super Air Jordans</h3>
    <p>Price: $199</p>
    <!-- HEALER FIX: Solved Keyboard Trap by converting to native button -->
    <button onclick="addToCart()" class="btn">Add to Cart</button>
    <a href="#">Read product details</a>
</div>`
