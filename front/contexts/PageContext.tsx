
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

interface PageInfo {
    title: React.ReactNode;
    actions?: React.ReactNode;
}

interface PageContextType extends PageInfo {
    setPageInfo: (info: PageInfo) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pageInfo, setPageInfo] = useState<PageInfo>({ title: 'Dashboard' });

    const handleSetPageInfo = useCallback((info: PageInfo) => {
        // Use a timeout to avoid rapid state updates during render cycles
        setTimeout(() => setPageInfo(info), 0);
    }, []);

    const value = useMemo(() => ({
        ...pageInfo,
        setPageInfo: handleSetPageInfo,
    }), [pageInfo, handleSetPageInfo]);
    
    return (
        <PageContext.Provider value={value}>
            {children}
        </PageContext.Provider>
    );
};

export const usePage = (): PageInfo => {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error('usePage must be used within a PageProvider');
    }
    return { title: context.title, actions: context.actions };
};

export const useSetPageInfo = () => {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error('useSetPageInfo must be used within a PageProvider');
    }
    return context.setPageInfo;
};
