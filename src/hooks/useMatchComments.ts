import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface MatchComment {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  comment: string;
  timestamp: string;
}

export function useMatchComments(matchId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const commentsRef = collection(db, 'match_comments');
    const q = query(commentsRef, where('matchId', '==', matchId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments: MatchComment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedComments.push({
            id: docSnap.id,
            matchId: data.matchId,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar || '',
            comment: data.comment,
            timestamp: data.timestamp || new Date().toISOString(),
          });
        });

        // Sort in memory by timestamp (newest first) to avoid composite index requirements
        fetchedComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setComments(fetchedComments);
        setLoading(false);
      },
      (error) => {
        console.warn('Match comments snapshot warning:', error);
        handleFirestoreError(error, OperationType.LIST, `match_comments (matchId=${matchId})`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [matchId]);

  const addComment = async (text: string) => {
    if (!user || !text.trim()) return false;

    try {
      const commentsRef = collection(db, 'match_comments');
      await addDoc(commentsRef, {
        matchId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous Fan',
        userAvatar: user.photoURL || '',
        comment: text.trim(),
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'match_comments');
      return false;
    }
  };

  return {
    comments,
    loading,
    addComment,
  };
}

