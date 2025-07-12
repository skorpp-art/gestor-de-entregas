
import React, { useState } from 'react';

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder: string;
    disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, placeholder, disabled = false }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className={`flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 ${disabled ? 'bg-slate-200 dark:bg-slate-600' : ''} border-slate-300 dark:border-slate-600`}>
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 bg-brand-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                        <span>{tag}</span>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-brand-100 hover:text-white"
                                aria-label={`Eliminar ${tag}`}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow bg-transparent focus:outline-none p-1 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default TagInput;
