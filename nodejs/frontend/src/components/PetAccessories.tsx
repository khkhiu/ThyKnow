
import React, { useState } from 'react';
import { ShoppingBag, Gift, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Accessory {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  type: 'hat' | 'necklace' | 'glasses';
  description: string;
}

interface PetAccessoriesProps {
  streakPoints: number;
  ownedAccessories: string[];
  equippedAccessories: string[];
  onBuyAccessory: (accessoryId: string, cost: number) => void;
  onEquipAccessory: (accessoryId: string, type: string) => void;
  onUnequipAccessory: (type: string) => void;
}

const PetAccessories = ({ 
  streakPoints, 
  ownedAccessories, 
  equippedAccessories,
  onBuyAccessory, 
  onEquipAccessory,
  onUnequipAccessory
}: PetAccessoriesProps) => {
  const [selectedTab, setSelectedTab] = useState<'shop' | 'wardrobe'>('shop');

  const availableAccessories: Accessory[] = [
    {
      id: 'explorer-hat',
      name: 'Explorer Hat',
      emoji: '🎩',
      cost: 5,
      type: 'hat',
      description: 'Perfect for prehistoric adventures!'
    },
    {
      id: 'safari-hat',
      name: 'Safari Hat',
      emoji: '👒',
      cost: 8,
      type: 'hat',
      description: 'Protection from the Jurassic sun'
    },
    {
      id: 'leaf-necklace',
      name: 'Leaf Necklace',
      emoji: '🍃',
      cost: 6,
      type: 'necklace',
      description: 'Made from ancient fern leaves'
    },
    {
      id: 'flower-crown',
      name: 'Flower Crown',
      emoji: '🌸',
      cost: 10,
      type: 'necklace',
      description: 'Beautiful prehistoric blooms'
    },
    {
      id: 'prehistoric-glasses',
      name: 'Dino Shades',
      emoji: '🕶️',
      cost: 7,
      type: 'glasses',
      description: 'Cool shades for a cool dino'
    },
    {
      id: 'bone-glasses',
      name: 'Bone Specs',
      emoji: '👓',
      cost: 9,
      type: 'glasses',
      description: 'For the intellectual dinosaur'
    }
  ];

  const handleBuyAccessory = (accessory: Accessory) => {
    if (streakPoints >= accessory.cost) {
      onBuyAccessory(accessory.id, accessory.cost);
    }
  };

  const handleEquipAccessory = (accessory: Accessory) => {
    const currentEquipped = equippedAccessories.find(id => {
      const acc = availableAccessories.find(a => a.id === id);
      return acc?.type === accessory.type;
    });
    
    if (currentEquipped) {
      onUnequipAccessory(accessory.type);
    }
    onEquipAccessory(accessory.id, accessory.type);
  };

  const isEquipped = (accessoryId: string) => equippedAccessories.includes(accessoryId);
  const isOwned = (accessoryId: string) => ownedAccessories.includes(accessoryId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dino Boutique</h2>
        <div className="flex items-center space-x-2 bg-amber-100 rounded-full px-3 py-1">
          <Gift className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-amber-700">{streakPoints} fossil coins</span>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <Button
          onClick={() => setSelectedTab('shop')}
          variant={selectedTab === 'shop' ? 'default' : 'outline'}
          className="flex-1"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Shop
        </Button>
        <Button
          onClick={() => setSelectedTab('wardrobe')}
          variant={selectedTab === 'wardrobe' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Star className="w-4 h-4 mr-2" />
          Wardrobe
        </Button>
      </div>

      {selectedTab === 'shop' && (
        <div className="grid grid-cols-1 gap-3">
          {availableAccessories.map((accessory) => (
            <div key={accessory.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{accessory.emoji}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{accessory.name}</h3>
                    <p className="text-sm text-gray-600">{accessory.description}</p>
                    <p className="text-xs text-amber-600 font-medium">{accessory.cost} fossil coins</p>
                  </div>
                </div>
                
                {isOwned(accessory.id) ? (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Owned
                  </div>
                ) : (
                  <Button
                    onClick={() => handleBuyAccessory(accessory)}
                    disabled={streakPoints < accessory.cost}
                    className="bg-gradient-to-r from-green-500 to-amber-500 hover:from-green-600 hover:to-amber-600 disabled:opacity-50"
                    size="sm"
                  >
                    Buy
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'wardrobe' && (
        <div className="grid grid-cols-1 gap-3">
          {availableAccessories
            .filter(accessory => isOwned(accessory.id))
            .map((accessory) => (
              <div key={accessory.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{accessory.emoji}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{accessory.name}</h3>
                      <p className="text-sm text-gray-600">{accessory.description}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleEquipAccessory(accessory)}
                    variant={isEquipped(accessory.id) ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {isEquipped(accessory.id) ? 'Unequip' : 'Equip'}
                  </Button>
                </div>
              </div>
            ))}
          
          {ownedAccessories.length === 0 && (
            <div className="text-center py-8">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No dino accessories yet!</p>
              <p className="text-gray-400 text-sm">Visit the shop to get some prehistoric gear</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PetAccessories;
