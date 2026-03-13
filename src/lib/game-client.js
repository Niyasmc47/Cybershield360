/**
 * CyberShield 360 - Game Client
 * 
 * Frontend integration for multiplayer 1v1 games
 * Use this in your Next.js pages to connect to the Flask backend
 */

import io from 'socket.io-client';
import { getBackendUrl } from './backend-url';

class GameClient {
  constructor() {
    this.socket = null;
    this.token = null;
    this.currentMatch = null;
    this.currentScore = 0;
    this.opponentScore = 0;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // ========== INITIALIZATION ==========
  
  /**
   * Connect to game server
   * @param {string} token JWT token from login
   * @param {object} callbacks Event listeners
   */
  connect(token, callbacks = {}) {
    this.token = token;
    const backendUrl = getBackendUrl();

    this.socket = io(backendUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    this.socket.on('connection_response', (data) => {
      console.log('✓ Connected to game server');
      this.reconnectAttempts = 0;
      callbacks.onConnect?.({ ...data });
    });

    // Game events
    this.socket.on('match_started', (data) => {
      this.currentMatch = data.match_id;
      this.currentScore = 0;
      this.opponentScore = 0;
      console.log('🎮 Match started:', data);
      callbacks.onMatchStart?.({ ...data });
    });

    this.socket.on('question', (data) => {
      console.log('❓ Question:', data);
      callbacks.onQuestion?.({ ...data });
    });

    this.socket.on('answer_feedback', (data) => {
      this.currentScore = data.your_score;
      this.opponentScore = data.opponent_score;
      console.log('📊 Answer feedback:', data);
      callbacks.onAnswerFeedback?.({ ...data });
    });

    this.socket.on('match_end', (data) => {
      console.log('🏁 Match ended:', data);
      this.currentMatch = null;
      callbacks.onMatchEnd?.({ ...data });
    });

    this.socket.on('waiting', (data) => {
      console.log('⏳ Waiting for opponent...', data);
      callbacks.onWaiting?.({ ...data });
    });

    this.socket.on('room_code_created', (data) => {
      console.log('🔐 Room code created:', data);
      callbacks.onRoomCodeCreated?.({ ...data });
    });

    this.socket.on('error', (data) => {
      console.error('❌ Error:', data);
      callbacks.onError?.({ ...data });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      callbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`Connection error (attempt ${this.reconnectAttempts}):`, error);
      callbacks.onConnectError?.({ error, attempt: this.reconnectAttempts });
    });
  }

  // ========== GAME ACTIONS ==========

  /**
   * Find a 1v1 opponent
   */
  findMatch() {
    if (!this.socket || !this.token) {
      console.error('Not connected. Call connect() first.');
      return;
    }
    console.log('🔍 Finding match...');
    this.socket.emit('find_match', { token: this.token });
  }

  /**
   * Create a private room code
   */
  createRoomCode() {
    if (!this.socket || !this.token) {
      console.error('Not connected. Call connect() first.');
      return;
    }

    console.log('🔐 Creating room code...');
    this.socket.emit('create_room_code', { token: this.token });
  }

  /**
   * Join a private room code
   * @param {string} roomCode
   */
  joinRoomCode(roomCode) {
    if (!this.socket || !this.token) {
      console.error('Not connected. Call connect() first.');
      return;
    }

    console.log('🚪 Joining room code:', roomCode);
    this.socket.emit('join_room_code', {
      token: this.token,
      room_code: roomCode
    });
  }

  /**
   * Submit answer to current question
   * @param {number} answerIndex Index of selected option (0-3)
   */
  submitAnswer(answerIndex) {
    if (!this.socket || !this.currentMatch) {
      console.error('No active match');
      return;
    }

    console.log('📝 Submitting answer:', answerIndex);
    this.socket.emit('answer', {
      match_id: this.currentMatch,
      token: this.token,
      answer: answerIndex
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentMatch = null;
    }
  }

  /**
   * Check if currently in a match
   */
  isInMatch() {
    return this.currentMatch !== null;
  }

  /**
   * Get current score
   */
  getScore() {
    return {
      your_score: this.currentScore,
      opponent_score: this.opponentScore
    };
  }

  // ========== REST API ==========

  /**
   * Register new user
   * @param {string} username
   * @param {string} email
   * @param {string} password
   */
  static async register(username, email, password) {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data; // { token, user }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   */
  static async login(email, password) {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data; // { token, user }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} token
   */
  static async getProfile(token) {
    try {
      const response = await fetch(`${getBackendUrl()}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Profile error:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard (top 20 players)
   */
  static async getLeaderboard() {
    try {
      const response = await fetch(`${getBackendUrl()}/api/leaderboard`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }

      return data;
    } catch (error) {
      console.error('Leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Get user's match history
   * @param {string} token
   */
  static async getMatchHistory(token) {
    try {
      const response = await fetch(`${getBackendUrl()}/api/match/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch match history');
      }

      return data;
    } catch (error) {
      console.error('Match history error:', error);
      throw error;
    }
  }
}

export default GameClient;
