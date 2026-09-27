import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';

export function useFeed() {
  const { allPosts, likePost } = useAuth();
  const [filter, setFilter] = useState<'for_you' | 'trending' | 'latest'>('for_you');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const posts = useMemo(() => {
    let result = [...allPosts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.userName.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filter === 'trending') {
      result.sort((a, b) => b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount));
    } else if (filter === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [allPosts, filter, searchQuery]);

  return {
    posts,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    activeCommentPostId,
    setActiveCommentPostId,
    likePost,
  };
}
