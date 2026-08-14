import rppg
import time
import cv2

# Initialize the default rPPG model (FacePhys)
model = rppg.Model()

print("Starting rPPG camera feed... Press 'q' to exit.")

# Open the default webcam stream safely using the toolkit context manager
with model.video_capture(0):
    last_process_time = 0
    current_hr = None
    
    for frame, box in model.preview:
        # Convert color space for OpenCV display compatibility
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Calculate heart rate metrics every 1 second to minimize latency
        now = time.time()
        if now - last_process_time > 1.0:
            result = model.hr(start=-10)
            if result and result.get('hr'):
                current_hr = result['hr']
                print(f"Real-time Heart Rate: {current_hr:.1f} BPM")
            last_process_time = now
            
        # Draw the face bounding box and live heart rate on the frame
        if box is not None:
            y1, y2 = box[0]
            x1, x2 = box[1]
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            if current_hr is not None:
                cv2.putText(
                    frame, 
                    f"HR: {current_hr:.1f} BPM", 
                    (x1, y1 - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    0.9, 
                    (0, 255, 0), 
                    2
                )
                
        cv2.imshow("PulseSense rPPG Monitor", frame)
        
        # Press 'q' key to quit the stream
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cv2.destroyAllWindows()