import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      // Handle real-time notifications
      newSocket.on('outbid', (data) => {
        toast.error(`You've been outbid on "${data.auctionTitle}"! New price: $${data.newPrice}`);
      });

      newSocket.on('auction_won', (data) => {
        toast.success(`Congratulations! You won "${data.auctionTitle}" for $${data.winningAmount}!`);
      });

      newSocket.on('auction_ended', (data) => {
        toast.info(`Auction "${data.title}" has ended. Final price: $${data.finalPrice}`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinAuction = (auctionId) => {
    if (socket && connected) {
      socket.emit('join_auction', auctionId);
    }
  };

  const leaveAuction = (auctionId) => {
    if (socket && connected) {
      socket.emit('leave_auction', auctionId);
    }
  };

  const placeBid = (auctionId, amount) => {
    return new Promise((resolve, reject) => {
      if (!socket || !connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      // Set up one-time listeners for this bid
      const onBidSuccess = (data) => {
        socket.off('bid_success', onBidSuccess);
        socket.off('bid_error', onBidError);
        resolve({ success: true, data });
      };

      const onBidError = (error) => {
        socket.off('bid_success', onBidSuccess);
        socket.off('bid_error', onBidError);
        reject(new Error(error.error));
      };

      socket.on('bid_success', onBidSuccess);
      socket.on('bid_error', onBidError);

      // Emit the bid
      socket.emit('place_bid', { auctionId, amount });

      // Timeout after 10 seconds
      setTimeout(() => {
        socket.off('bid_success', onBidSuccess);
        socket.off('bid_error', onBidError);
        reject(new Error('Bid timeout'));
      }, 10000);
    });
  };

  const value = {
    socket,
    connected,
    joinAuction,
    leaveAuction,
    placeBid
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
