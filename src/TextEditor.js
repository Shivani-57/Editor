import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import {io} from "socket.io-client"
import { useParams } from 'react-router-dom';

function TextEditor() {
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
      
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
      
        ['clean']                                         // remove formatting button
      ];
  const textEditorRef = useRef(null);
      const [socket,setSocket]=useState()
      const [quill,setQuill] = useState();
      const [userEmail,setuserEmail] = useState("");
      const [documentMode, setDocumentMode] = useState('')
      const [admin,setAdmin]=useState("")
      const { id } = useParams()
 
  useEffect(()=>{
    const email = prompt("Enter email")
    console.log("Emai;",email)
    setuserEmail(email)
    console.log("user email called")

  },[id])
  useEffect(() => {
    console.log("quill called")

    if (!textEditorRef.current) {
        const quillServer = new Quill('.texteditor', { theme: 'snow' ,modules:{toolbar:toolbarOptions}});
        textEditorRef.current = quillServer
        setQuill(quillServer)
        
    }
  }, [userEmail]);
  useEffect(()=>{
    console.log("connection called")

    const socketServer = io("http://localhost:5000")
    setSocket(socketServer)
    console.log("after socket")
    console.log("email (outside useEffect):", userEmail);

    return ()=>{
        socketServer.disconnect();
    }
  },[userEmail])
 
  useEffect(()=>{
    console.log("send change called")

    if(socket === null || quill === null)return

    const handleChange = (delta,oldData,source)=>{
        if(source !== "user")return

        socket && socket.emit("send-changes",delta)
    }
    quill && quill.on("text-change",handleChange)

    return ()=>{
        quill && quill.off("text-change",handleChange)
    }
  },[quill,socket,userEmail])

  useEffect(()=>{
    console.log("receive change called")

    if(socket === null || quill === null)return

    const handleChange = (delta)=>{
        quill.updateContents(delta)
    }
    socket && socket.on("receive-changes",handleChange)

    return ()=>{
        socket && socket.off("receive-changes",handleChange)
    }
  },[quill,socket,userEmail])

  useEffect(()=>{
    console.log("load document called")

    if(quill === null || socket===null)return
    socket && socket.once("load-document", document=>{
      console.log("In get content quill",document)
      // if(document.mode == "editable"){
        quill && quill.setContents(document.data)
        quill && quill.enable();
      // }
      // else{
      //   quill && quill.setContents(document.data)
      //   quill && quill.disable();
      // }
    })

    socket && socket.emit("get-document",{ documentId: id, userEmail: userEmail });
  },[quill,socket,id,userEmail])

  useEffect(()=>{
    console.log("save document called")
    
    if(socket === null || quill ===null)return

    const interval = setInterval(()=>{
        socket && socket.emit("save-document", quill.getContents())
    },2000)

    return ()=>{
        clearInterval(interval)
    }
  })
  // useEffect(() => {
  //   console.log("authenticate called")

  //   if (socket === null) return;

  //   socket && socket.emit("authenticate", {email:userEmail,documentId:id});
  //   socket && socket.emit('admin-status', ( data )=>{
  //     alert("Admin of Document",data.adminEmail)
  //     const tempadmin = data.adminEmail ;
  //     console.log("useremail",userEmail)
  //     console.log("adminEmail",data.adminEmail)
  //     console.log("save as admin", tempadmin)
  //     setAdmin(tempadmin)
  //   })

  // }, [socket, userEmail, id]);

  useEffect(() => {
    console.log("prompt called");
  
    if (socket === null) return;
  
    if (admin === userEmail) {
      const mode = prompt("You are admin, do you want the document to be editable or readonly");
  
      if (mode) {
        setDocumentMode(mode);
        socket && socket.emit('document-mode', { documentId: id, mode: mode });
      }
    }
  }, [admin, socket, userEmail, id, documentMode]);
  
    // useEffect(()=>{
    //   if(socket === null)return
    //   console.log("documentMode",documentMode)
    //   if(documentMode){
    //     console.log("inside if",documentMode)
    //   socket && socket.emit('document-mode', { documentId: id, mode: documentMode });
    // }
    // })

  return <div className='texteditor'></div>;
}

export default TextEditor;
