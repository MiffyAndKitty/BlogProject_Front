/**
 * 각 API 응답에 대한 인터페이스를 정의
 */
// export interface User {
//     id: number;
//     name: string;
//     email: string;
// }
// export interface Post {
//     id: number;
//     title: string;
//     content: string;
//     authorId: number;
// } 

// export interface Numbers {
//     num1: string,
//     num2: string
// }

export interface SignUpData {
    email:string,
    password?:string,
    provider?:string,
    nickname:string
}

export interface CheckDuplicatedData {
    column:string, //user_email, user_nickname 중 하나 
    data:string, //공백 X
}

export interface loginData {
    email:string,
    password:string, 
}

export interface newPost {
    title:string,
    content:string,
    public:Boolean,
    categoryId:string,
    tagNames:Array<string>,
    uploaded_files: Blob[]| null,
    boardId?: string,
}

export interface getPost{
    board_content: string
    board_id: string
    board_like: number
    board_order: number
    board_public: number
    board_title:string
    board_view: number
    category_id: string
    created_at: string
    deleted_at: null | string
    updated_at: string
    user_id: string
    board_comment: number
}
export interface getPostDetail{
    isLike: string,
    isWriter: Boolean
    board_id: string,
    user_id: string,
    category_id: string,
    board_title: string,
    board_content: string,
    board_view: number,
    board_like: number
    board_public : 0 | 1,
    created_at: string,
    updated_at:string,
    deleted_at : null | string,
    user_nickname : string
    board_comment:number,
    tags: string[]
    
}
export interface category {
    category_id:string,
    category_name:string,
}

export interface categories {
    category_id: string;
    category_name: string;
    subcategories: categories[];
}

export interface newCategory {
    categoryName:string,
    topcategoryId:string,
}

export interface deleteCategory {
    categoryId:string,
}

export interface changeCategory {
    categoryName:string,
    categoryId: string
}