import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import parentApi from '../api/parentApi';

const ParentChildContext = createContext(null);

export const ParentChildProvider = ({ children }) => {
  const { data: childrenList, isLoading } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: () => parentApi.getChildren(),
  });

  const childrenArray = Array.isArray(childrenList) ? childrenList : [];

  const [selectedChildId, setSelectedChildIdState] = useState(() => {
    return localStorage.getItem('parent_selected_child_id') || '';
  });

  // When children list loads, ensure selectedChildId is set
  useEffect(() => {
    if (childrenArray.length > 0) {
      const exists = childrenArray.some((c) => c._id === selectedChildId);
      if (!selectedChildId || !exists) {
        const firstId = childrenArray[0]._id;
        setSelectedChildIdState(firstId);
        localStorage.setItem('parent_selected_child_id', firstId);
      }
    }
  }, [childrenArray, selectedChildId]);

  const setSelectedChildId = (id) => {
    setSelectedChildIdState(id);
    localStorage.setItem('parent_selected_child_id', id);
  };

  const selectedChild =
    childrenArray.find((c) => c._id === selectedChildId) || childrenArray[0] || null;

  return (
    <ParentChildContext.Provider
      value={{
        children: childrenArray,
        selectedChild,
        selectedChildId: selectedChild?._id || '',
        setSelectedChildId,
        isLoadingChildren: isLoading,
      }}
    >
      {children}
    </ParentChildContext.Provider>
  );
};

export const useParentChild = () => {
  const context = useContext(ParentChildContext);
  if (!context) {
    throw new Error('useParentChild must be used within a ParentChildProvider');
  }
  return context;
};

export default ParentChildContext;
