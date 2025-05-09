import React, { useState, useRef, useEffect, CSSProperties, memo, useCallback } from 'react';
import { Product } from '../data/products';
import { cartService } from '../services/CartService';

interface ProductCardProps {
    product: Product;
    onSwipe: (direction: 'left' | 'right' | 'up', id: number) => void;
    onCartUpdate?: () => void;
}

const ProductCard = memo(({ product, onSwipe, onCartUpdate }: ProductCardProps) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleStart = useCallback((clientX: number, clientY: number) => {
        if (isAnimating) return;
        setIsDragging(true);
        setStartPos({ x: clientX, y: clientY });
    }, [isAnimating]);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;
        const deltaX = clientX - startPos.x;
        const deltaY = clientY - startPos.y;

        setPosition({
            x: deltaX,
            y: deltaY
        });
        setRotation(deltaX * 0.1);
    }, [isDragging, startPos]);

    const handleEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        const threshold = 50;
        const isHorizontalSwipe = Math.abs(position.x) > Math.abs(position.y);

        if (isHorizontalSwipe && position.x > threshold) {
            completeSwipe('right');
        } else if (isHorizontalSwipe && position.x < -threshold) {
            completeSwipe('left');
        } else if (!isHorizontalSwipe && position.y < -threshold) {
            addToCart();
        } else {
            setPosition({ x: 0, y: 0 });
            setRotation(0);
        }
    }, [isDragging, position]);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const touchStartHandler = (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                handleStart(touch.clientX, touch.clientY);
            }
        };

        const touchMoveHandler = (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        };

        const touchEndHandler = (e: TouchEvent) => {
            e.preventDefault();
            handleEnd();
        };

        card.addEventListener('touchstart', touchStartHandler, { passive: false });
        card.addEventListener('touchmove', touchMoveHandler, { passive: false });
        card.addEventListener('touchend', touchEndHandler, { passive: false });

        return () => {
            card.removeEventListener('touchstart', touchStartHandler);
            card.removeEventListener('touchmove', touchMoveHandler);
            card.removeEventListener('touchend', touchEndHandler);
        };
    }, [handleStart, handleMove, handleEnd]);

    function formatPrice(price: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    }

    function vibrate(pattern: number | number[]) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    function completeSwipe(direction: 'left' | 'right') {
        setExitDirection(direction);
        setIsAnimating(true);

        if (direction === 'right') {
            console.log(`Liked Product ID: ${product.id}`);
        } else {
            console.log(`Passed Product ID: ${product.id}`);
        }

        setTimeout(() => {
            setIsAnimating(false);
            onSwipe(direction, product.id);
        }, 400);
    }

    async function addToCart() {
        setExitDirection('up');
        setIsAnimating(true);
        vibrate([40, 60, 40]);

        console.log(`Add to cart Product ID: ${product.id}`);

        try {
            await cartService.addToCart(product);

            if (onCartUpdate) {
                onCartUpdate();
            }

            setTimeout(() => {
                setIsAnimating(false);
                onSwipe('up', product.id);
            }, 400);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setIsAnimating(false);
            setExitDirection(null);
            setPosition({ x: 0, y: 0 });
            setRotation(0);
        }
    }

    function handleLikeClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (isAnimating) return;

        vibrate(40);
        setExitDirection('right');
        setIsAnimating(true);

        console.log(`Liked Product ID: ${product.id}`);

        setTimeout(() => {
            setIsAnimating(false);
            onSwipe('right', product.id);
        }, 400);
    }

    function handleDislikeClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (isAnimating) return;

        vibrate(40);
        setExitDirection('left');
        setIsAnimating(true);

        console.log(`Passed Product ID: ${product.id}`);

        setTimeout(() => {
            setIsAnimating(false);
            onSwipe('left', product.id);
        }, 400);
    }

    function handleAddToCartClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (isAnimating) return;

        vibrate([40, 60, 40]);
        setExitDirection('up');
        setIsAnimating(true);

        console.log(`Add to cart Product ID: ${product.id}`);

        addToCart();
    }

    function handleMouseDown(e: React.MouseEvent) {
        handleStart(e.clientX, e.clientY);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (isAnimating) return;

        switch (e.key) {
            case 'ArrowRight':
                handleLikeClick(e as unknown as React.MouseEvent);
                break;
            case 'ArrowLeft':
                handleDislikeClick(e as unknown as React.MouseEvent);
                break;
            case 'ArrowUp':
                handleAddToCartClick(e as unknown as React.MouseEvent);
                break;
        }
    }

    useEffect(() => {
        function handleMouseLeave() {
            if (isDragging) {
                handleEnd();
            }
        }

        function handleEscKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && isDragging) {
                handleEnd();
            }
        }

        function handleGlobalMouseMove(e: MouseEvent) {
            handleMove(e.clientX, e.clientY);
        }

        function handleGlobalMouseUp() {
            handleEnd();
        }

        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isDragging, handleEnd, handleMove]);

    function getExitStyle(): CSSProperties {
        if (!exitDirection) return {};

        const baseStyle = {
            transition: 'all 0.4s cubic-bezier(0.2, 0, 0.2, 1)',
            pointerEvents: 'none' as const
        };

        switch (exitDirection) {
            case 'right':
                return {
                    ...baseStyle,
                    transform: `translateX(200%) rotate(30deg)`,
                    opacity: 0
                };
            case 'left':
                return {
                    ...baseStyle,
                    transform: `translateX(-200%) rotate(-30deg)`,
                    opacity: 0
                };
            case 'up':
                return {
                    ...baseStyle,
                    transform: `translateY(-200%)`,
                    opacity: 0
                };
            default:
                return baseStyle;
        }
    }

    function getDragStyles(): CSSProperties {
        return {
            transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.2, 0, 0.2, 1)',
            cursor: isDragging ? 'grabbing' : 'grab',
            willChange: 'transform',
            touchAction: 'none'
        };
    }

    const { name, brand, price, imageUrl, discountPercentage } = product;

    return (
        <div
            ref={cardRef}
            className="relative w-full max-w-[320px] h-[480px] bg-white rounded-xl shadow-lg overflow-hidden select-none"
            style={{
                ...getDragStyles(),
                ...(exitDirection ? getExitStyle() : {}),
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Product card for ${name} by ${brand}`}
        >
            <div className="relative w-full h-full">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    draggable={false}
                />
                {discountPercentage > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold shadow-md">
                        {discountPercentage}% OFF
                    </div>
                )}

                {/* Swipe indicators */}
                {position.x > 50 && (
                    <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-green-500/90 text-white p-2 rounded-full shadow-lg">
                        <img src="/svg/heart-filled.svg" alt="Like" className="w-6 h-6" />
                    </div>
                )}

                {position.x < -50 && (
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-red-500/90 text-white p-2 rounded-full shadow-lg">
                        <img src="/svg/cross-filled.svg" alt="Dislike" className="w-6 h-6" />
                    </div>
                )}

                {position.y < -50 && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white p-2 rounded-full shadow-lg">
                        <img src="/svg/cart.svg" alt="Add to cart" className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-bold mb-1">{name}</h3>
                <p className="text-sm opacity-90 mb-2">{brand}</p>
                <p className="text-lg font-semibold">{formatPrice(price)}</p>
            </div>
        </div>
    );
});

export default ProductCard; 