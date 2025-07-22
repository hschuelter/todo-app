import { useState } from 'react';

interface UseAddTodoModalProps {
  onAddTodo: (title: string, description: string, dueDate: string) => Promise<boolean>;
}

export const useAddTodoModal = ({ onAddTodo }: UseAddTodoModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [todoTitle, setTodoTitle] = useState<string>('');
  const [todoDescription, setTodoDescription] = useState<string>('');
  const [todoDueDate, setTodoDueDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => setIsOpen(true);
  
  const closeModal = () => {
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTodoTitle('');
    setTodoDescription('');
    setTodoDueDate('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    e.preventDefault();
    
    if (!todoTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onAddTodo(todoTitle, todoDescription, todoDueDate);
    
    if (success) {
      closeModal();
    }
    
    setIsSubmitting(false);
  };

  return {
    isOpen,
    todoTitle,
    todoDescription,
    todoDueDate,
    isSubmitting,
    setTodoTitle,
    setTodoDescription,
    setTodoDueDate,
    openModal,
    closeModal,
    handleSubmit,
  };
};