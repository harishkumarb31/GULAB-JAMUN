import type { BirthdayData } from '../types';

export const INITIAL_BIRTHDAY_DATA: BirthdayData = {
  recipient: {
    name: 'Bhoomika',
    nickname: 'Bhoomi',
    age: 20,
    birthDate: '22 November',
    occasion: '20th Birthday',
  },
  headlines: {
    main: 'Happy 20th Birthday, Bhoomika! ♡',
    secondary: 'A new chapter, a thousand dreams, and endless reasons to smile.',
    tagline: 'For a girl who makes life bloom.',
    closing: 'Keep blooming, Bhoomika. The world is more beautiful with you in it.',
  },
  letter: {
    title: 'A Little Letter For You...',
    salutation: 'Dear Bhoomika,',
    body: [
      'Twenty years of life, countless little moments, and a whole new chapter waiting to unfold.',
      'Today is all about celebrating you.',
      'May your days be filled with laughter, your dreams find their wings, and your heart always find reasons to smile.',
      'Never stop being the wonderful person you are. Keep exploring, keep dreaming, keep laughing, and keep blooming in your own beautiful way.',
      'You deserve all the happiness this world has to offer.',
      'Happy 20th Birthday, Bhoomika!',
    ],
    closing: 'With lots of love,',
    sender: 'Someone who wishes you the very best.',
  },
  secretMessage:
    'One little reminder: You are appreciated, you are special, and you deserve every beautiful thing coming your way. Never forget that. ♡',
  celebration: {
    main: 'TWENTY LOOKS BEAUTIFUL ON YOU!',
    secondary:
      "Here's to new beginnings, beautiful adventures, unforgettable memories, and a year full of happiness.",
  },
  wishes: [
    {
      quote: 'May your life always be filled with colours, happiness, beautiful surprises, and endless dreams.',
      author: 'Birthday Wish',
    },
    {
      quote: 'Some people are like flowers... they make everything around them beautiful.',
      author: 'The Story of Bloom',
    },
    {
      quote: 'In a garden of memories, your smile is the brightest blossom.',
      author: 'Heartfelt Notes',
    },
    {
      quote: 'Twenty years of grace, warmth, and quiet magic.',
      author: 'Chapter Twenty',
    },
  ],
  memories: [
    {
      id: 'mem-1',
      title: 'Moments of Joy',
      date: 'Special Memory 1',
      caption: 'Every picture holds a little piece of happiness.',
      location: 'Cherished Times',
      imageUrl: '/images/memories/6.jpeg',
      rotation: -2.5,
      tags: ['Happiness', 'Smile'],
    },
    {
      id: 'mem-2',
      title: 'Golden Days',
      date: 'Special Memory 2',
      caption: 'Quiet moments that make life truly special.',
      location: 'Sunny Days',
      imageUrl: '/images/memories/J5.jpeg',
      rotation: 3,
      tags: ['Warmth', 'Peace'],
    },
    {
      id: 'mem-3',
      title: 'Radiant Smile',
      date: 'Special Memory 3',
      caption: 'Bringing light and beauty into every day.',
      location: 'Sweet Moments',
      imageUrl: '/images/memories/J4.jpg',
      rotation: -1.8,
      tags: ['Laughter', 'Grace'],
    },
    {
      id: 'mem-4',
      title: 'Timeless Memories',
      date: 'Special Memory 4',
      caption: 'Looking ahead with hope, wonder, and endless dreams.',
      location: 'Adventures',
      imageUrl: '/images/memories/J3.jpg',
      rotation: 2.2,
      tags: ['Memories', 'Bloom'],
    },
    {
      id: 'mem-5',
      title: 'Quiet Reflections',
      date: 'Special Memory 5',
      caption: 'Moments that stay with us, gently remembered.',
      location: 'Beautiful Days',
      imageUrl: '/images/memories/J2.jpg',
      rotation: -3,
      tags: ['Treasures', 'Calm'],
    },
    {
      id: 'mem-6',
      title: 'Celebration of You',
      date: 'Special Memory 6',
      caption: 'Some moments become memories. Some memories become treasures.',
      location: 'Chapter Twenty',
      imageUrl: '/images/memories/J1.jpeg',
      rotation: 1.8,
      tags: ['Bhoomika', 'Twenty'],
    },
  ],
};
