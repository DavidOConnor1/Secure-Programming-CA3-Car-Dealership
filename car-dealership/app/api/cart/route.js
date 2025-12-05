import { cookies } from "next/headers";
import {
  getCartWithItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../lib/db/queries";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId =
      cookieStore.get("cart_session")?.value ||
      `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    //no cart session, make cart session
    if (!cookieStore.get("cart_session")) {
      cookieStore.set("cart_session", sessionId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    const cart = await getCartWithItems(sessionId);

    return Response.json(cart || { items: [], total: 0, count: 0 });
  } catch (error) {
    console.error("Error fetching cart:", error);
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

    const cart = await addToCart(sessionId, vehicleId, quantity);

    return Response.json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
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

    const cart = await updateCartItem(sessionId, vehicleId, quantity);

    return Response.json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
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

    if (vehicleId) {
      // Remove specific item
      const cart = await removeFromCart(sessionId, vehicleId);
      return Response.json(cart);
    } else {
      // Clear entire cart
      await clearCart(sessionId);
      return Response.json({ success: true });
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    return Response.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
