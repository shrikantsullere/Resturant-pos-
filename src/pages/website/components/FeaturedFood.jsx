import React from 'react';
import { motion } from 'framer-motion';
<<<<<<< HEAD
import { Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import pizzaImg from '../../../assets/landing/pizza.png';
import burgerImg from '../../../assets/landing/burger.png';
import pastaImg from '../../../assets/landing/pasta.png';
import dessertImg from '../../../assets/landing/dessert.png';
import drinksImg from '../../../assets/landing/drinks.png';

const foods = [
  { id: 1, name: 'Premium Pepperoni Pizza', rating: 4.9, img: pizzaImg, tag: 'Best Seller' },
  { id: 2, name: 'Double Wagyu Burger', rating: 4.8, img: burgerImg, tag: 'Hot' },
  { id: 3, name: 'Truffle Cream Pasta', rating: 4.7, img: pastaImg, tag: 'Premium' },
  { id: 4, name: 'Molten Lava Cake', rating: 4.9, img: dessertImg, tag: 'Dessert' },
  { id: 5, name: 'Signature Fruit Mojito', rating: 4.6, img: drinksImg, tag: 'Cooler' },
];

const FeaturedFood = () => {
=======
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMenu } from '../../../context/MenuContext';
import { getImageUrl } from '../../../utils/imageUtils';

const FeaturedFood = () => {
  const { items, loading } = useMenu();

  // We will display the first 5 popular items, or just the first 5 items if none are marked popular.
  const popularItems = items.filter(item => item.popular).slice(0, 5);
  const displayItems = popularItems.length >= 5 ? popularItems : items.slice(0, 5);

>>>>>>> 01688e58b9866ba1b34ee34e6ad8ff98ebce771e
  return (
    <section className="py-12 bg-background overflow-hidden" id="menu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-landing-primary font-bold uppercase tracking-widest text-sm">Special Menu</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display mt-2 text-text-primary">Featured Food</h2>
          </div>
          <Link to="/menu" className="hidden md:flex items-center text-landing-primary font-bold hover:translate-x-2 transition-transform">
            View All Menu <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {foods.map((food, index) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
                          className="bg-surface border border-border rounded-3xl p-4 shadow-premium group hover:border-primary/30 hover:shadow-premium-hover transition-all duration-300"
            >
              <div className="relative mb-6 overflow-hidden rounded-xl bg-background">
                <img 
                  src={food.img} 
                  alt={food.name} 
                  className="w-full h-48 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" 
                />
                <span className="absolute top-3 left-3 bg-landing-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                  {food.tag}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-landing-secondary text-sm">
                  <Star size={14} className="fill-landing-secondary mr-1" />
                  <span>{food.rating}</span>
                </div>
                <span className="text-text-secondary text-xs">Rating</span>
              </div>
              <h3 className="text-lg font-bold mb-4 line-clamp-1 text-text-primary">{food.name}</h3>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[10px] font-black text-landing-primary uppercase tracking-[0.2em]">
                   Gourmet Selection
                </span>
                <div className="w-8 h-8 rounded-full bg-surface/5 flex items-center justify-center text-text-secondary">
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
=======
        {loading ? (
          <div className="flex justify-center items-center py-12 text-slate-400">Loading featured items...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {displayItems.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#fff8f2] border border-[#ffe5d0] rounded-3xl p-4 shadow-sm group hover:shadow-md transition-all duration-300"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center">
                  {getImageUrl(food.image).length > 2 && !getImageUrl(food.image).includes('🍽️') ? (
                    <img 
                      src={getImageUrl(food.image)} 
                      alt={food.name} 
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2" 
                    />
                  ) : (
                     <div className="w-full h-48 flex items-center justify-center bg-slate-100">
                       <span className="text-6xl">{getImageUrl(food.image)}</span>
                     </div>
                  )}
                  <span className="absolute top-3 left-3 bg-[#f58b44] text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    {food.category || 'Special'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-[#7ec7aa] text-sm font-bold">
                    <Star size={14} className="fill-[#7ec7aa] text-[#7ec7aa] mr-1" />
                    <span>{food.rating || 4.5}</span>
                  </div>
                  <span className="text-slate-400 text-xs font-medium">Rating</span>
                </div>
                
                <h3 className="text-lg font-black mb-4 line-clamp-1 text-slate-800">{food.name}</h3>
                
                <div className="mt-4 pt-4 border-t border-[#ffe5d0] flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#f58b44] uppercase tracking-widest">
                     Gourmet Selection
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
>>>>>>> 01688e58b9866ba1b34ee34e6ad8ff98ebce771e
      </div>
    </section>
  );
};

export default FeaturedFood;
