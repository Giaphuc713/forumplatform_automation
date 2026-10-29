import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types/forum';
import { forumService } from '@/services/forum.service';
import Cookies from 'js-cookie';
const CURRENT_USER_ID = Number(Cookies.get("current_user"));
export type FilterMode = 'best' | 'tag' | 'trending';

export function usePosts(searchQuery: string = '', filterMode: FilterMode = 'best', tagFilter: string = '') {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        setPosts([]);
        setPage(0);
        setHasMore(true);

        try {
            if (searchQuery.trim()) {
                const { posts } = await forumService.searchPosts(searchQuery, 0, 10);
                setPosts(posts);
                setHasMore(posts.length > 0);
            } else if (filterMode === 'trending') {
                const { posts } = await forumService.getTrendingPosts(0, 10);
                setPosts(posts);
                setHasMore(posts.length > 0);
            } else if (filterMode === 'tag') {
                if (tagFilter.trim() === '') {
                    return;
                }
                const { posts } = await forumService.getPostsByTag(tagFilter.trim(), 0, 10);
                setPosts(posts);
                setHasMore(posts.length > 0);
            } else {
                const results = await forumService.getFeed(CURRENT_USER_ID, 0, 10);
                setPosts(results.posts);
                setHasMore(results.posts.length > 1);
            }
        } catch (error) {
            console.error('Lỗi khi tải bài viết:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterMode, tagFilter]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const loadMore = useCallback(async () => {
        if (fetchingMore || !hasMore) return;

        setFetchingMore(true);
        try {
            const nextPage = page + 1;

            if (searchQuery.trim()) {
                const { posts } = await forumService.searchPosts(searchQuery, nextPage, 10);
                if (posts.length > 0) {
                    setPosts(prev => [...prev, ...posts]);
                    setPage(nextPage);
                    setHasMore(posts.length > 0);
                } else {
                    setHasMore(false);
                }
            } else if (filterMode === 'trending') {
                const { posts } = await forumService.getTrendingPosts(nextPage, 10);
                if (posts.length > 0) {
                    setPosts(prev => [...prev, ...posts]);
                    setPage(nextPage);
                    setHasMore(posts.length > 0);
                } else {
                    setHasMore(false);
                }
            } else if (filterMode === 'tag') {
                if (tagFilter.trim() === '') {
                    setHasMore(false);
                    return;
                }
                const { posts } = await forumService.getPostsByTag(tagFilter.trim(), nextPage, 10);
                if (posts.length > 0) {
                    setPosts(prev => [...prev, ...posts]);
                    setPage(nextPage);
                    setHasMore(posts.length > 0);
                } else {
                    setHasMore(false);
                }
            } else {
                const results = await forumService.getFeed(CURRENT_USER_ID, nextPage, 10);
                if (results.posts.length > 0) {
                    setPosts(prev => [...prev, ...results.posts]);
                    setPage(nextPage);
                    setHasMore(results.posts.length > 0);
                } else {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải thêm bài viết:', error);
        } finally {
            setFetchingMore(false);
        }
    }, [page, fetchingMore, hasMore, searchQuery, filterMode, tagFilter]);

    const refetch = useCallback(() => {
        loadPosts();
    }, [loadPosts]);

    const removePost = useCallback((postId: number) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    }, []);

    const updatePost = useCallback((updatedPost: Post) => {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    }, []);

    return { posts, loading, fetchingMore, hasMore, loadMore, refetch, removePost, updatePost };
}
