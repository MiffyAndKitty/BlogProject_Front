/**
 * 각 API 응답에 대한 인터페이스를 정의
 */
export interface User {
    id: number;
    name: string;
    email: string;
}
export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
} 

export interface Numbers {
    num1: string,
    num2: string
}