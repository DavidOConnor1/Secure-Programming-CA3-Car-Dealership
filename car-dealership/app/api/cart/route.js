import { cookies } from "next/headers";
import { cartRepository, queryObserver } from "../../lib/db/queries";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId =
      cookieStore.get("cart_session")?.value ||
      `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // No cart session, create one
    if (!cookieStore.get("cart_session")) {
      cookieStore.set("cart_session", sessionId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    // FACADE PATTERN: Use repository interface
    const cart = await cartRepository.getCartWithItems(sessionId);

    // OBSERVER PATTERN: Notify of cart fetch
    queryObserver.notify('cart_fetch', { 
      sessionId, 
      itemCount: cart?.items?.length || 0 
    });

    return Response.json(cart || { items: [], total: 0, count: 0 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    
    // OBSERVER PATTERN: Notify of error
    queryObserver.notify('cart_error', { 
      action: 'GET', 
      error: error.message 
    });
    
    return Response.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionId =
      cookieStore.get("cart_session")?.value ||
      `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { vehicleId, quantity = 1 } = await request.json();

    if (!vehicleId) {
      return Response.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    // FACTORY + FACADE PATTERN: 
    const cart = await cartRepository.addToCart(sessionId, vehicleId, quantity);

    // OBSERVER PATTERN: Notify of cart addition
    queryObserver.notify('cart_add', { 
      sessionId, 
      vehicleId, 
      quantity,
      newItemCount: cart.items.length,
      newTotal: cart.total
    });

    return Response.json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    
    // OBSERVER PATTERN: Notify of error
    queryObserver.notify('cart_error', { 
      action: 'POST', 
      vehicleId: request.vehicleId,
      error: error.message 
    });
    
    return Response.json(
      { error: error.message || "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value;

    if (!sessionId) {
      return Response.json({ error: "No cart session found" }, { status: 400 });
    }

    const { vehicleId, quantity } = await request.json();

    if (!vehicleId || quantity === undefined) {
      return Response.json(
        { error: "Vehicle ID and quantity are required" },
        { status: 400 }
      );
    }

    // STRATEGY PATTERN
    const cart = await cartRepository.updateCartItem(sessionId, vehicleId, quantity);

    // OBSERVER PATTERN: Notify of cart update
    queryObserver.notify('cart_update', { 
      sessionId, 
      vehicleId, 
      quantity,
      action: quantity > 0 ? 'update' : 'remove',
      newItemCount: cart.items.length
    });

    return Response.json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    
    // OBSERVER PATTERN: Notify of error
    queryObserver.notify('cart_error', { 
      action: 'PUT', 
      vehicleId: request.vehicleId,
      error: error.message 
    });
    
    return Response.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value;

    if (!sessionId) {
      return Response.json({ error: "No cart session found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");

    let result;
    
    // STRATEGY PATTERN: Different strategies for specific vs clear all
    if (vehicleId) {
      // Remove specific item using repository
      const cart = await cartRepository.removeFromCart(sessionId, vehicleId);
      result = cart;
      
      // OBSERVER PATTERN: Notify of item removal
      queryObserver.notify('cart_remove', { 
        sessionId, 
        vehicleId,
        remainingItems: cart.items.length
      });
    } else {
      // Clear entire cart using repository
      await cartRepository.clearCart(sessionId);
      result = { success: true };
      
      // OBSERVER PATTERN: Notify of cart clearance
      queryObserver.notify('cart_clear', { sessionId });
    }

    return Response.json(result);
  } catch (error) {
    console.error("Error clearing cart:", error);
    
    // OBSERVER PATTERN: Notify of error
    queryObserver.notify('cart_error', { 
      action: 'DELETE', 
      error: error.message 
    });
    
    return Response.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}

// OBSERVER SETUP 
// You can add this to a separate initialization file or here:

// Example observer subscriptions for logging/analytics
queryObserver.subscribe((event, data) => {
  switch(event) {
    case 'cart_add':
      console.log(`Cart Item Added: Vehicle ${data.vehicleId}, Quantity ${data.quantity}`);
      console.log(`Cart now has ${data.newItemCount} items, Total: $${data.newTotal}`);
      break;
      
    case 'cart_update':
      console.log(`Cart Updated: Vehicle ${data.vehicleId}, New Quantity ${data.quantity}`);
      break;
      
    case 'cart_remove':
      console.log(`Cart Item Removed: Vehicle ${data.vehicleId}`);
      console.log(`   ${data.remainingItems} items remaining in cart`);
      break;
      
    case 'cart_clear':
      console.log(`🧹 Cart Cleared: Session ${data.sessionId}`);
      break;
      
    case 'cart_error':
      console.error(`❌ Cart Error in ${data.action}:`, data.error);
      break;
  }
});

// Example observer for analytics (could be extended)
class CartAnalyticsObserver {
  constructor() {
    this.metrics = {
      itemsAdded: 0,
      itemsRemoved: 0,
      cartsCleared: 0,
      errors: 0
    };
  }

  update(event, data) {
    switch(event) {
      case 'cart_add':
        this.metrics.itemsAdded += data.quantity;
        break;
      case 'cart_remove':
        this.metrics.itemsRemoved++;
        break;
      case 'cart_clear':
        this.metrics.cartsCleared++;
        break;
      case 'cart_error':
        this.metrics.errors++;
        break;
    }
    
    console.log('📊 Cart Analytics:', this.metrics);
  }
}

// Subscribe analytics observer
const analyticsObserver = new CartAnalyticsObserver();
queryObserver.subscribe((event, data) => analyticsObserver.update(event, data));