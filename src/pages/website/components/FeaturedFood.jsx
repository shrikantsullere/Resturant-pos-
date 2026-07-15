import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMenu } from '../../../../context/MenuContext';
import { getImageUrl } from '../../../../utils/imageUtils';

const FeaturedFood = () => {
  const { items, loading } = useMenu();

  // We will display the first 5 popular items, or just the first 5 items if none are marked popular.
  const popularItems = items.filter(item => item.popular).slice(0, 5);
  const displayItems = popularItems.length >= 5 ? popularItems : items.slice(0, 5);

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
                className="bg-surface border border-border rounded-3xl p-4 shadow-premium group hover:border-primary/30 hover:shadow-premium-hover transition-all duration-300"
              >
                <div className="relative mb-6 overflow-hidden rounded-xl bg-background flex items-center justify-center">
                  {getImageUrl(food.image).length > 2 && !getImageUrl(food.image).includes('🍽️') ? (
                    <img 
                      src={getImageUrl(food.image)} 
                      alt={food.name} 
                      className="w-full h-48 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" 
                    />
                  ) : (
                     <span className="text-6xl my-10">{getImageUrl(food.image)}</span>
                  )}
                  <span className="absolute top-3 left-3 bg-landing-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                    {food.category || 'Special'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-landing-secondary text-sm">
                    <Star size={14} className="fill-landing-secondary mr-1" />
                    <span>{food.rating || 4.5}</span>
                  </div>
                  <span className="text-text-secondary text-xs font-bold">${food.price}</span>
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
        )}
      </div>
    </section>
  );
};

export default FeaturedFood;
