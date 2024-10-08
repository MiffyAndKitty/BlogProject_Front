// src/components/CategoryList.tsx
import React, { useEffect, useState } from 'react';
import { categories as Categories } from '../types/index';
import up_arrow from '../img/up_arrow.png';
import down_arrow from '../img/down_arrow.png';
import './CategoryList.css';
import ConfirmModal from './ConfirmModal'; 
import move_category from '../img/moveCategory.png';
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const ItemType = {
  CATEGORY: 'category',
};
interface CategoryListProps {
  categories: Categories[];
  level?: number;
  expandedCategories: string[];
  toggleCategory: (categoryId: string) => void;
  onAddSubcategory: (parentCategoryId: string, subcategoryName: string) => void;
  onEditCategory: (categoryId: string, newCategoryName: string) => void;
  onEditCategoryLevel: (categoryId: string, topcategoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDragEnd: (result: DropResult, level:number, parentId:string) => void;
  parentId?:string,
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, level = 0,parentId, expandedCategories, toggleCategory, onAddSubcategory, onEditCategory,onEditCategoryLevel, onDeleteCategory ,onDragEnd}) => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [addingSubcategoryId, setAddingSubcategoryId] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null); 
  const moveCategory = (draggedId: string, targetId: string) => {
    onEditCategoryLevel(draggedId, targetId);
  };

 

  const handleMouseEnter = (event: React.MouseEvent,categoryId: string) => {
    event.stopPropagation();  // 이벤트 전파 막기
    setHoveredCategoryId(categoryId);
  
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    event.stopPropagation();  // 이벤트 전파 막기
    setHoveredCategoryId(null);
  
  };
  const handleDeleteCategory = (categoryId: string) => {
    console.log(
      `
      
      
      
      handleDeleteCategory
      
      
      
      
      `,categoryId
    )
    setCategoryToDelete(categoryId);
    setIsModalOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
    }
    setIsModalOpen(false);
    setCategoryToDelete(null);
  };
  const getByteLength = (str: string) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
        byteLength += str.charCodeAt(i) > 0x007f ? 3 : 1; // 한글 3바이트, 영문 1바이트
    }
    return byteLength;
 };
 const changeCategory = (value:string)=>{
  if(getByteLength(value)>48){
    alert('카테고리는 한글16자/영문48자 이하로 입력해주세요.')
  }else{
    setNewCategoryName(value);
  }
  
};
const changeSubCategory = (value:string)=>{
  if(getByteLength(value)>48){
    alert('카테고리는 한글16자/영문48자 이하로 입력해주세요.')
  }else{
    setNewSubcategoryName(value);
  }
  
};
  const toEditCategory=(category_id:string,category_name:string) =>{
    setEditingCategoryId(category_id);
    if(getByteLength(category_name)>48){
      alert('카테고리는 한글16자/영문48자 이하로 입력해주세요.')
    }else{
      setNewCategoryName(category_name);
    }
   

  }
  return (
    <>
      
            {categories.map((category, index) => (
              <Droppable key={category.category_id} droppableId={category.category_id || "root"} type="CATEGORY">
              {(provided,snapshot) => (
                <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? 'pink' : 'white',  // 드래그 중일 때 배경색 변경
                  // padding: '4px',
                  // marginBottom: '4px',
                  // borderRadius: '4px',
                  // minHeight: '100px', 
                  // borderTop:snapshot.isDraggingOver ?'2px solid red' : 'none'
                }}
              >

              {provided.placeholder}

             
                <div 
                key={category.category_id}
                onMouseEnter={(e) => handleMouseEnter(e, category.category_id)}
                onMouseLeave={(e) => handleMouseLeave(e)}
              >
                <div style={{ cursor: 'pointer' }} className={`category-item-list level-0`}>
                  {editingCategoryId === category.category_id ? (
                    <div>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => changeCategory(e.target.value)}    
                      />
                      <button className='addChangeDeleteBtn' onClick={() => { onEditCategory(category.category_id, newCategoryName); setEditingCategoryId(null); }}>저장</button>
                      <button className='addChangeDeleteBtn' onClick={() => setEditingCategoryId(null)}>취소</button>
                    </div>
                  ) : (
                    <div>
                      <span onClick={() => toggleCategory(category.category_id)} style={{backgroundColor:'transparent', padding:'5px', marginRight:'-5px'}}>
                        {level ===0 && (
                          expandedCategories.includes(category.category_id) 
                            ? <img className='arrow'  src={up_arrow} alt="up arrow" /> 
                            : <img className='arrow'  src={down_arrow} alt="down arrow" />
                        )}
                      </span>
                
                      {category.category_name}
                      <span className='addChangeDeleteBtn'>
                        {level === 0&& (
                          <button className='addChangeDeleteBtn' onClick={() => setAddingSubcategoryId(category.category_id)}>추가</button>
                        )}
                        <button className='addChangeDeleteBtn' onClick={() =>toEditCategory(category.category_id, category.category_name)}>수정</button>
                        { !category.subcategories && (
                          <>
                          <button className='addChangeDeleteBtn' onClick={() => handleDeleteCategory(category.category_id)}>삭제</button>
                          <ConfirmModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onConfirm={confirmDeleteCategory}
                            message="이 카테고리를 삭제하시겠습니까?"
                          />
                          </>
                        )}
                       
                      </span>
                    </div>
                  )}
                </div>

                {addingSubcategoryId === category.category_id && (
                  <div className={`category-item-list level-1`}>
                    <input
                      type="text"
                      value={newSubcategoryName}
                      onChange={(e) => changeSubCategory(e.target.value)}
                      placeholder={`${category.category_name}의 하위 카테고리 이름`}
                    />
                    <button className='addOrCancelBtn' onClick={() => { onAddSubcategory(category.category_id, newSubcategoryName); setAddingSubcategoryId(null); setNewSubcategoryName('');}}>저장</button>
                    <button className='addOrCancelBtn' onClick={() => {setAddingSubcategoryId(null); setNewSubcategoryName('');}}>취소</button>
                  </div>
                )}


                {expandedCategories.includes(category.category_id) && category.subcategories && category.subcategories.length > 0 && (

                  <>
                  {category.subcategories.map((category, index) => (

                   
                      <Draggable key={category.category_id} draggableId={category.category_id} index={index} >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.5 : 1,
                            background: snapshot.isDragging ? 'white' : 'white',  // 드래그 중일 때 배경색 변경
                            cursor: 'move',
                            padding: '3px',
                            marginBottom: '4px',
                            borderRadius: '4px',
                            border: snapshot.isDragging ? '2px dashed #fd429f' : '1px solid #ddd'  // 드래그 중일 때 테두리 변경
                          }}
                          
                        >
                          <div 
                            key={category.category_id}
                            onMouseEnter={(e) => handleMouseEnter(e, category.category_id)}
                            onMouseLeave={(e) => handleMouseLeave(e)}
                          >
                            <div style={{ cursor: 'pointer' }} className={`category-item-list level-1`}>
                              {editingCategoryId === category.category_id ? (
                                <div>
                                  <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => changeCategory(e.target.value)}    
                                  />
                                  <button className='addChangeDeleteBtn' onClick={() => { onEditCategory(category.category_id, newCategoryName); setEditingCategoryId(null); }}>저장</button>
                                  <button className='addChangeDeleteBtn' onClick={() => setEditingCategoryId(null)}>취소</button>
                                </div>
                              ) : (
                                <div>
                                  <span onClick={() => toggleCategory(category.category_id)} style={{backgroundColor:'transparent', padding:'5px', marginRight:'-5px'}}>
                                 
                                  </span>
                                  <span style={{backgroundColor:'transparent', padding:'5px'}}>
                                    <img src={move_category} style={{width:'12px', height:'auto'}}></img>
                                  </span>
                                  {category.category_name}
                                  <span className='addChangeDeleteBtn'>
                            
                                    <button className='addChangeDeleteBtn' onClick={() =>toEditCategory(category.category_id, category.category_name)}>수정</button>
                                    {( !category.subcategories) && (
                                      <>
                                        <button className='addChangeDeleteBtn' onClick={() => handleDeleteCategory(category.category_id)}>삭제</button>
                                        <ConfirmModal
                                          isOpen={isModalOpen}
                                          onClose={() => setIsModalOpen(false)}
                                          onConfirm={confirmDeleteCategory}
                                          message="이 카테고리를 삭제하시겠습니까?"
                                        />
                                      </>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
    
                          </div>
                        </div>
                      )}
                    </Draggable>
                 

                  ))}
                  </>
                )}
              </div>
            
          </div>
        )}
      </Droppable>
            ))}
            
            </>
  );
  
};

export default CategoryList;
