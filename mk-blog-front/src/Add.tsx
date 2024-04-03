import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

interface AddProps{

}
const Add : React.FC<AddProps> = (props)=>{

    const [number1, setNumber1] = useState('');
    const [number2, setNumber2] = useState('');

    const Result =(event: React.MouseEvent<HTMLButtonElement>)=>{
        event.preventDefault(); // 버튼의 기본 동작 방지
        console.log("숫자 1:", number1, "숫자 2:", number2);
        // 숫자 1과 숫자 2의 값을 계산 또는 처리
    }
    return (
<>
    <Form>
      <Form.Group className="mb-3" >
        <Form.Label>숫자 1</Form.Label>
        <Form.Control placeholder="1" value={number1} onChange={(e) => setNumber1(e.target.value)}/>
      </Form.Group>
            + 
      <Form.Group className="mb-3" >
        <Form.Label>숫자 2</Form.Label>
        <Form.Control placeholder="1" value={number2} onChange={(e) => setNumber2(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3" >
        <Form.Label>||</Form.Label>
        <Form.Control placeholder="2" />
      </Form.Group>
    </Form>
    <Button variant="primary" type="submit" onClick={Result}>결과</Button>
    </>
    );
}
export default  Add;