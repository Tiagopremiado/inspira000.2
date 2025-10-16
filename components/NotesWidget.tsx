
import React, { useState, useEffect, useRef } from 'react';
import { Folder, Note } from '../types';
import { FolderIcon, NoteIcon, PlusIcon, TrashIcon } from './icons';

const STORAGE_KEY = 'inspira_notes_widget';

const NotesWidget: React.FC = () => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const newFolderInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setFolders(parsedData.folders || []);
                setActiveFolderId(parsedData.activeFolderId || null);
                setActiveNoteId(parsedData.activeNoteId || null);
            } else {
                 // Initialize with default folder and note if empty
                const defaultNoteId = `note-${Date.now()}`;
                const defaultFolderId = `folder-${Date.now()}`;
                const initialFolders: Folder[] = [{
                    id: defaultFolderId,
                    name: 'Minhas Anotações',
                    notes: [{
                        id: defaultNoteId,
                        title: 'Bem-vindo!',
                        content: 'Use este bloco de notas para organizar seus estudos. Crie pastas e notas como desejar!',
                        lastSaved: new Date().toISOString()
                    }]
                }];
                setFolders(initialFolders);
                setActiveFolderId(defaultFolderId);
                setActiveNoteId(defaultNoteId);
            }
        } catch (error) {
            console.error("Failed to load notes from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            const dataToSave = JSON.stringify({ folders, activeFolderId, activeNoteId });
            localStorage.setItem(STORAGE_KEY, dataToSave);
        } catch (error) {
            console.error("Failed to save notes to localStorage", error);
        }
    }, [folders, activeFolderId, activeNoteId]);

    const activeFolder = folders.find(f => f.id === activeFolderId);
    const activeNote = activeFolder?.notes.find(n => n.id === activeNoteId);
    
    const handleCreateFolder = (name: string) => {
        if (!name.trim()) return;
        const newFolder: Folder = { id: `folder-${Date.now()}`, name, notes: [] };
        setFolders([...folders, newFolder]);
        setActiveFolderId(newFolder.id);
        setActiveNoteId(null);
        setIsCreatingFolder(false);
    };

    const handleCreateNote = () => {
        if (!activeFolderId) return;
        const newNote: Note = { 
            id: `note-${Date.now()}`, 
            title: 'Nova Nota', 
            content: '',
            lastSaved: new Date().toISOString()
        };
        const updatedFolders = folders.map(f =>
            f.id === activeFolderId ? { ...f, notes: [...f.notes, newNote] } : f
        );
        setFolders(updatedFolders);
        setActiveNoteId(newNote.id);
    };

    const handleUpdateNote = (field: 'title' | 'content', value: string) => {
        if (!activeFolderId || !activeNoteId) return;
        const updatedFolders = folders.map(f =>
            f.id === activeFolderId
                ? {
                    ...f,
                    notes: f.notes.map(n =>
                        n.id === activeNoteId ? { ...n, [field]: value, lastSaved: new Date().toISOString() } : n
                    ),
                }
                : f
        );
        setFolders(updatedFolders);
    };

    const handleDeleteFolder = (folderId: string) => {
        if (!window.confirm("Tem certeza que deseja apagar esta pasta e todas as suas notas?")) return;
        const updatedFolders = folders.filter(f => f.id !== folderId);
        setFolders(updatedFolders);
        if (activeFolderId === folderId) {
            setActiveFolderId(updatedFolders[0]?.id || null);
            setActiveNoteId(updatedFolders[0]?.notes[0]?.id || null);
        }
    }
    
    const handleDeleteNote = (noteId: string) => {
         if (!window.confirm("Tem certeza que deseja apagar esta nota?")) return;
        if (!activeFolderId) return;
        const updatedFolders = folders.map(f =>
            f.id === activeFolderId ? { ...f, notes: f.notes.filter(n => n.id !== noteId) } : f
        );
        setFolders(updatedFolders);
        if(activeNoteId === noteId){
            setActiveNoteId(updatedFolders.find(f => f.id === activeFolderId)?.notes[0]?.id || null)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-xl w-full h-[60vh] flex overflow-hidden border border-gray-200">
            {/* Folders Panel */}
            <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Pastas</h3>
                    <button onClick={() => setIsCreatingFolder(true)} className="text-gray-500 hover:text-blue-600">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {folders.map(folder => (
                        <div key={folder.id} onClick={() => {setActiveFolderId(folder.id); setActiveNoteId(folder.notes[0]?.id || null)}}
                             className={`p-3 flex items-center justify-between cursor-pointer text-sm ${activeFolderId === folder.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`}>
                            <div className="flex items-center space-x-2">
                                <FolderIcon className="w-4 h-4"/>
                                <span className="truncate">{folder.name}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {isCreatingFolder && (
                        <div className="p-2">
                            <input
                                ref={newFolderInputRef}
                                type="text"
                                placeholder="Nome da pasta..."
                                onBlur={(e) => handleCreateFolder(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder(e.currentTarget.value)}
                                autoFocus
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Panel */}
            <div className="w-1/4 border-r border-gray-200 flex flex-col">
                <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">{activeFolder?.name || 'Notas'}</h3>
                    <button onClick={handleCreateNote} disabled={!activeFolder} className="text-gray-500 hover:text-blue-600 disabled:opacity-50">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {activeFolder?.notes.map(note => (
                        <div key={note.id} onClick={() => setActiveNoteId(note.id)}
                             className={`p-3 cursor-pointer border-b ${activeNoteId === note.id ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                            <div className="flex justify-between items-start">
                                <h4 className={`font-semibold text-sm truncate ${activeNoteId === note.id ? 'text-gray-900' : 'text-gray-700'}`}>{note.title}</h4>
                                 <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-gray-400 hover:text-red-500">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">{note.content || 'Sem conteúdo adicional'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Panel */}
            <div className="w-1/2 flex flex-col">
                {activeNote ? (
                    <>
                        <div className="p-4 border-b">
                            <input
                                type="text"
                                value={activeNote.title}
                                onChange={(e) => handleUpdateNote('title', e.target.value)}
                                className="text-2xl font-bold w-full focus:outline-none"
                                placeholder="Título da Nota"
                            />
                        </div>
                        <div className="flex-grow p-4">
                            <textarea
                                value={activeNote.content}
                                onChange={(e) => handleUpdateNote('content', e.target.value)}
                                className="w-full h-full resize-none focus:outline-none text-gray-800 leading-relaxed"
                                placeholder="Comece a escrever..."
                            />
                        </div>
                         <div className="p-2 border-t text-right text-xs text-gray-400">
                           Salvo em: {new Date(activeNote.lastSaved).toLocaleTimeString()}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col justify-center items-center text-gray-500">
                        <NoteIcon className="w-16 h-16 mb-4"/>
                        <p>{activeFolder ? 'Selecione ou crie uma nota.' : 'Selecione ou crie uma pasta.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesWidget;
