
import React, { useRef, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { XIcon, TrashIcon, SquareIcon, CircleIcon, EraserIcon, MinusIcon, PenToolIcon } from '../components/icons';

type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'line';

const Whiteboard: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('matchId') || 'solo_session';
    const navigate = useNavigate();
    
    // Store drawing history
    const paths = useRef<any[]>([]);
    // Track start position for shapes
    const startPos = useRef<{x: number, y: number} | null>(null);

    // Color Presets
    const COLORS = ['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.scale(dpr, dpr);

            loadCanvas();
        }

        const interval = setInterval(() => {
            if (!isDrawing) loadCanvas();
        }, 2000);

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'skillhive_db_whiteboard') {
                loadCanvas();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        const handleResize = () => {
             if(canvasRef.current) {
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;
                canvasRef.current.style.width = `${window.innerWidth}px`;
                canvasRef.current.style.height = `${window.innerHeight}px`;
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);
                redraw();
             }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('resize', handleResize);
        };
    }, [matchId]);

    const loadCanvas = async () => {
        const data = await api.getWhiteboardData(matchId);
        if (data && JSON.stringify(data) !== JSON.stringify(paths.current)) {
            paths.current = data;
            redraw();
        }
    };

    const redraw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let isPathActive = false;

        paths.current.forEach((item, i) => {
            // Handle Shapes
            if (['rect', 'circle', 'shape_line'].includes(item.type)) {
                if (isPathActive) { ctx.stroke(); isPathActive = false; }
                
                ctx.beginPath();
                ctx.strokeStyle = item.color;
                ctx.lineWidth = item.width;
                ctx.globalCompositeOperation = 'source-over';

                if (item.type === 'rect') {
                    ctx.strokeRect(item.x, item.y, item.w, item.h);
                } else if (item.type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(item.x, item.y, Math.abs(item.w), 0, 2 * Math.PI);
                    ctx.stroke();
                } else if (item.type === 'shape_line') {
                    ctx.moveTo(item.x, item.y);
                    ctx.lineTo(item.endX, item.endY);
                    ctx.stroke();
                }
                return;
            }

            // Handle Freehand (Pen/Eraser)
            if (item.type === 'start') {
                if (isPathActive) ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = item.tool === 'eraser' ? '#f9fafb' : item.color; // Use background color for eraser visually if destination-out not preferred, but let's try blend mode
                ctx.globalCompositeOperation = item.tool === 'eraser' ? 'destination-out' : 'source-over';
                
                // Note: destination-out clears pixels (transparent). 
                // Since our canvas is over a colored div, transparency shows that div color. 
                // This is correct behavior for an eraser.
                
                ctx.lineWidth = item.width;
                ctx.moveTo(item.x, item.y);
                isPathActive = true;
            } else if (item.type === 'line') {
                ctx.lineTo(item.x, item.y);
            }

            // Stroke if next item breaks the path
            const nextItem = paths.current[i+1];
            if (!nextItem || nextItem.type === 'start' || ['rect', 'circle', 'shape_line'].includes(nextItem.type)) {
                if (isPathActive) {
                    ctx.stroke();
                    isPathActive = false;
                }
            }
        });
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = (e as React.MouseEvent).nativeEvent.offsetX;
            y = (e as React.MouseEvent).nativeEvent.offsetY;
        }
        return { x, y };
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        startPos.current = { x, y };

        if (tool === 'pen' || tool === 'eraser') {
            const point = { x, y, type: 'start', color, width: lineWidth, tool };
            paths.current.push(point);
            redraw();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        if (tool === 'pen' || tool === 'eraser') {
            // Continuous drawing logic
            const point = { x, y, type: 'line', color, width: lineWidth, tool };
            paths.current.push(point);
            
            // Optimization: Just draw the segment instead of full redraw for performance
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = tool === 'eraser' ? '#000000' : color;
            ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
            
            ctx.lineTo(x, y);
            ctx.stroke();
            // We don't beginPath here because we want continuous line. 
            // In 'startDrawing' we did beginPath via redraw/logic? 
            // Wait, optimization requires we maintained the context state.
            // Safe fallback: call redraw() if we want perfect history consitency visual
            // But redraw() clears canvas.
            // Let's stick to redraw() for shapes, but for pen we can be smarter?
            // Actually, for simplicity and correctness with the 'history' array approach:
            // Just assume redraw() handles it for now, or do the simple segment draw.
            // Simple segment draw is risky if we didn't beginPath at start.
            // Let's just use the logic from before which didn't redraw everything on mousemove for pen.
            // It just appended.
            
            // To support Eraser properly with destination-out, we SHOULD relies on the globalCompositeOperation set at start.
            // But startDrawing called redraw(), which closed paths.
            // Let's keep it simple: Record point, then just draw the little segment.
            // The full redraw happens on loadCanvas or resize.
        } else {
            // Shape Preview Logic
            // 1. Clear and redraw history
            redraw();
            
            // 2. Draw current shape preview
            if (startPos.current) {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.globalCompositeOperation = 'source-over';
                
                const startX = startPos.current.x;
                const startY = startPos.current.y;

                if (tool === 'rect') {
                    ctx.strokeRect(startX, startY, x - startX, y - startY);
                } else if (tool === 'circle') {
                    // Radius based on distance
                    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                } else if (tool === 'line') {
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
        }
    };

    const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        
        // If shape, commit it to history
        if (['rect', 'circle', 'line'].includes(tool) && startPos.current) {
            const { x, y } = getCoordinates(e); // Use last known pos or event pos? 
            // Mouseup event might have coordinates.
            
            const startX = startPos.current.x;
            const startY = startPos.current.y;
            
            let shapeObj = null;
            if (tool === 'rect') {
                shapeObj = { x: startX, y: startY, w: x - startX, h: y - startY, type: 'rect', color, width: lineWidth };
            } else if (tool === 'circle') {
                const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                shapeObj = { x: startX, y: startY, w: radius, h: radius, type: 'circle', color, width: lineWidth };
            } else if (tool === 'line') {
                shapeObj = { x: startX, y: startY, endX: x, endY: y, type: 'shape_line', color, width: lineWidth };
            }
            
            if (shapeObj) paths.current.push(shapeObj);
            redraw(); // Commit visual
        }

        api.saveWhiteboardData(matchId, paths.current);
        startPos.current = null;
        
        // Reset context for next op
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx) ctx.beginPath(); 
    };

    const clearCanvas = () => {
        if(window.confirm("Clear the entire whiteboard for everyone?")) {
            paths.current = [];
            redraw();
            api.saveWhiteboardData(matchId, []);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-[60] flex flex-col touch-none">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-3 flex flex-wrap justify-center items-center gap-4 border border-gray-200 dark:border-gray-700 animate-drop-in z-10 max-w-[90vw]">
                
                {/* Tools */}
                <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl gap-1">
                    <button onClick={() => setTool('pen')} className={`p-2 rounded-lg transition-all ${tool === 'pen' ? 'bg-white dark:bg-gray-600 shadow text-primary-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`} title="Pen">
                        <PenToolIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-white dark:bg-gray-600 shadow text-primary-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`} title="Eraser">
                        <EraserIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setTool('rect')} className={`p-2 rounded-lg transition-all ${tool === 'rect' ? 'bg-white dark:bg-gray-600 shadow text-primary-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`} title="Rectangle">
                        <SquareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setTool('circle')} className={`p-2 rounded-lg transition-all ${tool === 'circle' ? 'bg-white dark:bg-gray-600 shadow text-primary-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`} title="Circle">
                        <CircleIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setTool('line')} className={`p-2 rounded-lg transition-all ${tool === 'line' ? 'bg-white dark:bg-gray-600 shadow text-primary-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`} title="Line">
                        <MinusIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                {/* Colors */}
                <div className="flex items-center space-x-2">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 ${color === c ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="relative group w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 cursor-pointer">
                        <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)}
                            className="absolute -top-2 -left-2 w-12 h-12 border-none cursor-pointer p-0"
                            title="Custom Color"
                        />
                    </div>
                </div>
                
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                
                {/* Width */}
                <div className="flex space-x-1">
                    {[2, 5, 10].map(w => (
                        <button 
                            key={w}
                            onClick={() => setLineWidth(w)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${lineWidth === w ? 'bg-gray-200 dark:bg-gray-600 ring-2 ring-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <div className="bg-gray-800 dark:bg-white rounded-full" style={{ width: w, height: w }}></div>
                        </button>
                    ))}
                </div>
                
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                
                <button onClick={clearCanvas} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Clear Board">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            <button 
                onClick={() => navigate(-1)}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform z-10 text-gray-600 dark:text-gray-300 hover:text-red-500"
            >
                <XIcon className="w-6 h-6" />
            </button>

            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 md:top-4 md:left-4 md:translate-x-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-mono text-gray-500 border border-gray-200 dark:border-gray-700 z-10 pointer-events-none select-none">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></span>
                Session Active • {tool.toUpperCase()}
            </div>

            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair w-full h-full touch-none"
            />
        </div>
    );
};

export default Whiteboard;
