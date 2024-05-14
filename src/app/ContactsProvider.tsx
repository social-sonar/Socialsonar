import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { FlattenContact } from '@/lib/definitions'

type ContactContextType = {
  contacts: FlattenContact[]
  updateContact: (
    id: string | number,
    newValue: Partial<FlattenContact>,
  ) => void
  setContacts: (newValue: FlattenContact[]) => void,
  getContactByID: (id: string | number) => FlattenContact | undefined
}

const ContactContext = createContext<ContactContextType>({
  contacts: [],
  updateContact: () => {},
  setContacts: () => {},
  getContactByID: (id: string | number) => undefined
})

export const useContacts = () => useContext(ContactContext)

interface ContactProviderProps {
  children: ReactNode
}

export const ContactProvider: React.FC<ContactProviderProps> = ({
  children,
}) => {
  const [contacts, setItems] = useState<FlattenContact[]>([])

  const setContacts = (newContacts: FlattenContact[]) => {
    setItems(newContacts)
  }

  const updateContact = (
    id: string | number,
    newValue: Partial<FlattenContact>,
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, ...newValue } : item,
      ),
    )
  }

  const getContactByID = (id: string | number) => {
    const foundContact = contacts.find((contact) => contact.id === id);
    return foundContact;
  };

  return (
    <ContactContext.Provider value={{ contacts, updateContact, setContacts, getContactByID }}>
      {children}
    </ContactContext.Provider>
  )
}
