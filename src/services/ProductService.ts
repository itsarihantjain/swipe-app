import { Product, products as initialProducts } from "../data/products";

export interface IProductService {
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  likeProduct(id: number): Promise<void>;
  passProduct(id: number): Promise<void>;
}

export class ProductService implements IProductService {
  private products: Product[] = [...initialProducts];
  private likedProducts: number[] = [];
  private passedProducts: number[] = [];

  async getProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.products]);
      }, 300);
    });
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.products.find((product) => product.id === id));
      }, 100);
    });
  }

  async likeProduct(id: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.likedProducts.includes(id)) {
          this.likedProducts.push(id);
          console.log(`Liked Product ID: ${id}`);
        }
        resolve();
      }, 100);
    });
  }

  async passProduct(id: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.passedProducts.includes(id)) {
          this.passedProducts.push(id);
          console.log(`Passed Product ID: ${id}`);
        }
        resolve();
      }, 100);
    });
  }
}

const productService = new ProductService();
export { productService };
