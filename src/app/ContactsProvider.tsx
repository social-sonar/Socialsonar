import { createContext, useContext, useState, ReactNode } from 'react';
import { FlattenContact } from '@/lib/definitions';

type ContactContextType = {
    contacts: FlattenContact[];
    updateContact: (id: string | number, newValue: Partial<FlattenContact>) => void;
    setContacts: (newValue: FlattenContact[]) => void;
};

const ContactContext = createContext<ContactContextType>({
    contacts: [],
    updateContact: () => {},
    setContacts: () => {}
});

export const useContacts = () => useContext(ContactContext);

interface ContactProviderProps {
    children: ReactNode;
}

export const ContactProvider: React.FC<ContactProviderProps> = ({ children }) => {
    const [contacts, setItems] = useState<FlattenContact[]>([]);

    const setContacts =  (newContacts: FlattenContact[]) => {
        setItems(newContacts);
    };

    const updateContact = (id: string | number, newValue: Partial<FlattenContact>) => {
        setItems(currentItems =>
            currentItems.map(item =>
                item.id === id ? { ...item, ...newValue } : item
            )
        );
    };

    return (
        <ContactContext.Provider value={{ contacts, updateContact, setContacts }}>
            {children}
        </ContactContext.Provider>
    );
};
