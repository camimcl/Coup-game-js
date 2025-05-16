import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Shield, Skull, Crown, Swords, RefreshCw } from 'lucide-react';

const RulesScreen: React.FC = () => {
  const navigate = useNavigate();
  
  const characters = [
    {
      name: 'Duke',
      icon: <Crown size={24} className="text-purple-400" />,
      color: 'bg-purple-900',
      actions: ['Take 3 coins from the treasury', 'Block someone from taking foreign aid'],
    },
    {
      name: 'Captain',
      icon: <Swords size={24} className="text-blue-400" />,
      color: 'bg-blue-900',
      actions: ['Take 2 coins from another player', 'Block someone from stealing coins from you'],
    },
    {
      name: 'Ambassador',
      icon: <RefreshCw size={24} className="text-green-400" />,
      color: 'bg-green-900',
      actions: ['Draw 2 cards from the Court deck and choose which influences to keep', 'Block someone from stealing coins from you'],
    },
    {
      name: 'Countess',
      icon: <Shield size={24} className="text-pink-400" />,
      color: 'bg-pink-900',
      actions: ['Block an assassination attempt against you'],
    },
    {
      name: 'Assassin',
      icon: <Skull size={24} className="text-red-400" />,
      color: 'bg-red-900',
      actions: ['Pay 3 coins to assassinate another player\'s influence'],
    },
  ];
  
  const basicActions = [
    {
      name: 'Income',
      description: 'Take 1 coin from the treasury',
      icon: <Coins size={20} className="text-yellow-400" />,
    },
    {
      name: 'Foreign Aid',
      description: 'Take 2 coins from the treasury (can be blocked by Duke)',
      icon: <Coins size={20} className="text-yellow-400" />,
    },
    {
      name: 'Coup',
      description: 'Pay 7 coins to launch a coup against another player (cannot be blocked)',
      icon: <Shield size={20} className="text-red-400" />,
    },
  ];
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-8"
        >
          <button
            className="text-white hover:text-gray-300 mr-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Game Rules</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p className="mb-4">
              Coup is a game of deception, bluffing, and strategy where your goal is to be the last player with influence remaining. Each player starts with two influence cards (characters) that are kept face down.
            </p>
            <p className="mb-4">
              On your turn, you must take one action. You can claim to be any character, whether you have that card or not. Other players can challenge your claim - if you're caught lying, you lose an influence, but if you were telling the truth, the challenger loses an influence.
            </p>
            <p>
              The game ends when only one player has influence left.
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Setup</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>All players start with 2 coins and 2 influence cards</li>
              <li>
                The deck size depends on the number of players:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>3-5 players: 3 of each character (15 cards)</li>
                  <li>6-7 players: 4 of each character (20 cards)</li>
                  <li>8-10 players: 5 of each character (25 cards)</li>
                </ul>
              </li>
              <li>The maximum number of coins a player can have is 10</li>
              <li>If a player starts their turn with 10+ coins, they must perform a Coup</li>
            </ul>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Characters</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {characters.map((character, index) => (
                <motion.div
                  key={character.name}
                  className={`${character.color} rounded-lg p-4`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-center mb-3">
                    {character.icon}
                    <h3 className="text-xl font-bold ml-2">{character.name}</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-2">
                    {character.actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Basic Actions</h2>
            <div className="space-y-4">
              {basicActions.map((action, index) => (
                <motion.div
                  key={action.name}
                  className="bg-slate-700 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-center mb-1">
                    {action.icon}
                    <h3 className="text-lg font-bold ml-2">{action.name}</h3>
                  </div>
                  <p>{action.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Challenging and Blocking</h2>
            <h3 className="text-xl font-bold mb-2">Challenging</h3>
            <p className="mb-4">
              When a player claims to be a character, any other player can challenge that claim.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                If the challenged player was bluffing, they lose an influence (reveal one of their cards).
              </li>
              <li>
                If the challenged player was telling the truth, they show the character, return it to the deck, shuffle the deck, and draw a new card. The challenger loses an influence.
              </li>
            </ul>
            
            <h3 className="text-xl font-bold mb-2">Blocking</h3>
            <p className="mb-4">
              Some actions can be blocked by certain characters:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Duke can block Foreign Aid</li>
              <li>Captain or Ambassador can block Stealing</li>
              <li>Countess can block Assassination</li>
            </ul>
            <p className="mt-4">
              Blocking claims can also be challenged!
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              onClick={() => navigate('/')}
            >
              Back to Menu
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RulesScreen;