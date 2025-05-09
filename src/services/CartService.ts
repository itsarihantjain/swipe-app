import { Product } from "../data/products";

export interface ICartService {
  addToCart(product: Product): Promise<void>;
  getCartItems(): Promise<Product[]>;
  getCartCount(): Promise<number>;
}

export class CartService implements ICartService {
  private cartItems: Product[] = [];

  async addToCart(product: Product): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.cartItems.some((item) => item.id === product.id)) {
          this.cartItems.push(product);
          console.log(`Added to cart: ${product.name}`);
        }
        resolve();
      }, 100);
    });
  }

  async getCartItems(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.cartItems]);
      }, 100);
    });
  }

  async getCartCount(): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.cartItems.length);
      }, 50);
    });
  }
}

const cartService = new CartService();
export { cartService };
