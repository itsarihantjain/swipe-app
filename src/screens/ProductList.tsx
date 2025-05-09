import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../data/products';
import { productService } from '../services/ProductService';

interface ProductListProps {
    onCartUpdate?: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ onCartUpdate }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [hasEnded, setHasEnded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsLoading(true);
                const data = await productService.getProducts();

                Promise.all(
                    data.slice(0, 5).map(product => {
                        return new Promise(resolve => {
                            const img = new Image();
                            img.onload = () => resolve(true);
                            img.onerror = () => resolve(false);
                            img.src = product.imageUrl;
                        });
                    })
                ).then(() => {
                    setProducts(data);
                    setIsLoading(false);
                });
            } catch (error) {
                console.error('Error loading products:', error);
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    const handleSwipe = async (direction: 'left' | 'right' | 'up', id: number) => {
        try {
            const product = products.find(p => p.id === id);

            if (!product) {
                console.error(`Product with ID ${id} not found`);
                return;
            }

            switch (direction) {
                case 'left':
                    await productService.passProduct(id);
                    break;
                case 'right':
                    await productService.likeProduct(id);
                    break;
                case 'up':
                    break;
            }

            const nextProducts = products.filter(p => p.id !== id);

            setProducts(current =>
                current.map(p =>
                    p.id === id
                        ? { ...p, isExiting: true }
                        : p
                )
            );

            setTimeout(() => {
                setProducts(nextProducts);
                if (nextProducts.length === 0) {
                    setHasEnded(true);
                }
            }, 100);
        } catch (error) {
            console.error(`Error handling ${direction} action:`, error);
        }
    };

    const resetProducts = async () => {
        try {
            setIsLoading(true);
            const data = await productService.getProducts();
            setProducts(data);
            setHasEnded(false);
        } catch (error) {
            console.error('Error resetting products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[320px] mx-auto px-4 py-4">
            <div className="relative w-full min-h-[480px] flex justify-center items-center">
                {isLoading ? (
                    <div className="text-center p-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading products...</p>
                    </div>
                ) : hasEnded ? (
                    <div className="bg-white rounded-xl shadow-md p-6 text-center max-w-xs">
                        <h3 className="text-lg font-bold mb-3">All caught up!</h3>
                        <p className="text-gray-600 text-sm mb-4">You've seen all products</p>
                        <button
                            onClick={resetProducts}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                            Start Over
                        </button>
                    </div>
                ) : (
                    products.slice(0, 3).map((product, index) => {
                        const isInteractive = index === 0;
                        const scale = 1 - (index * 0.05);
                        const translateY = index * 8;
                        const opacity = 1 - (index * 0.2);
                        const transitionDuration = `${0.1 + (index * 0.05)}s`;

                        return (
                            <div
                                key={product.id}
                                className="absolute"
                                style={{
                                    zIndex: products.length - index,
                                    opacity,
                                    pointerEvents: isInteractive ? 'auto' : 'none',
                                    width: '100%',
                                    transition: `all ${transitionDuration} cubic-bezier(0.2, 0, 0.2, 1)`,
                                    willChange: 'transform, opacity',
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    transform: `scale(${scale}) translateY(${translateY}px)`,
                                    transformOrigin: 'center center',
                                    perspective: '1000px'
                                }}
                            >
                                <ProductCard
                                    product={product}
                                    onSwipe={handleSwipe}
                                    onCartUpdate={onCartUpdate}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ProductList; 