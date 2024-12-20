"use client";
import { useState, useRef } from 'react';
import { PiMicrophoneLight } from "react-icons/pi";

interface VoiceRecorderProps {
    setTranscript: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveBtn: React.Dispatch<React.SetStateAction<number | null>>;
}


const blobToBase64 = (blob: Blob, callback: (base64: string) => void): void => {
    const reader = new FileReader();
    reader.onload = function () {
        const result = reader.result as string;
        const base64data = result.split(",")[1];
        callback(base64data);
    };
    reader.readAsDataURL(blob);
};

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ setTranscript, setActiveBtn }) => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);


    const matchingKeywords = (text: string | null) => {
        if (text?.includes("ของขวัญ")) {
            console.log(text);
            setActiveBtn(6)
        } else if (text?.includes("เช็คชัวร์ก่อนเดินทาง") || text?.includes("กิจกรรม") || text?.includes("คิกออฟ")) {
            console.log(text);
            setActiveBtn(2)
        } else if (text?.includes("รถ") || text?.includes("ตรวจ") || text?.includes("เช็ค") || text?.includes("สภาพ") || text?.includes("สภาพ") || text?.includes("ที่ไหน")) {
            console.log(text);
            setActiveBtn(3)
        } else if (text?.includes("ใคร") || text?.includes("ชื่ออะไร") || text?.includes("ทำอะไร") || text?.includes("แนะนำ")) {
            console.log(text);
            setActiveBtn(4)
        } else if (text?.includes("สนับสนุน") || text?.includes("หน่วยงาน")) {
            console.log(text);
            setActiveBtn(5)
        } else if (text?.includes("สวัสดี")) {
            console.log(text);
            setActiveBtn(6)
        }
        
        else {
            console.log(text);
            setActiveBtn(8)
        }
    }

    const getText = (base64: string): void => {
    };

    const generateRandomString = (length: number): string => {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    };

    const uploadAudioToTranscription = async (audioBlob: Blob): Promise<string | null> => {
        const randomString = generateRandomString(10);
        const formData = new FormData();

        formData.append("audio", audioBlob, `${randomString}.mp3`);
        formData.append("hash", randomString);

        try {
            const response = await fetch("https://nippon.creaivelab.com/speech_to_text/upload-audio", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                console.error('Error uploading audio:', response.statusText);
                return null;
            }

            const transcription = await response.json();

            return transcription.text_output || null;
        } catch (error) {
            console.error('Failed to upload and transcribe audio:', error);
            return null;
        }
    };

    const startRecording = async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                blobToBase64(audioBlob, getText);
                audioChunksRef.current = [];

                const audioURL = URL.createObjectURL(audioBlob);
                setAudioUrl(audioURL);
                const transcription = await uploadAudioToTranscription(audioBlob);

                console.log('Transcription Response:', transcription);
                setTranscript(transcription)

                matchingKeywords(transcription)

            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            alert('Error accessing microphone. Please check your permissions.');
            console.error('Error accessing microphone', error);
        }
    };

    const stopRecording = (): void => {
        if (!mediaRecorderRef.current) {
            console.warn('No active media recorder to stop.');
            return;
        }
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    return (
        <div className="voice-recorder w-[120px] h-[120px]">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full h-full ${isRecording ? 'bg-red-600' : 'bg-white text-black'} transition-colors rounded-full`}
            >
                <PiMicrophoneLight className={`w-full h-[50%] ${isRecording ? "text-black w-full m-auto animate-ping duration-700" : "text-black w-full m-auto "}`} />
            </button>
        </div>
    );
}


export default VoiceRecorder;