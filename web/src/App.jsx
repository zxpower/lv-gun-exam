import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Bookmark, 
  BarChart3, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Filter,
  Play,
  CheckSquare,
  Sparkles,
  Search,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, study, exam, bookmarks, stats
  
  // Study mode states
  const [studySection, setStudySection] = useState('all');
  const [studyIndex, setStudyIndex] = useState(0);
  const [studySelectedAnswers, setStudySelectedAnswers] = useState({});
  const [studyShowResult, setStudyShowResult] = useState(false);

  // Exam mode states
  const [examActive, setExamActive] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(40 * 60); // 40 minutes in seconds

  // Bookmarks & progress
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gun_exam_bookmarks')) || [];
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gun_exam_stats')) || {
        completedExams: 0,
        passedExams: 0,
        totalAnswered: 0,
        correctAnswers: 0,
        questionHistory: {} // qId: { correct: 0, incorrect: 0 }
      };
    } catch {
      return {
        completedExams: 0,
        passedExams: 0,
        totalAnswered: 0,
        correctAnswers: 0,
        questionHistory: {}
      };
    }
  });

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [filterBookmarkOnly, setFilterBookmarkOnly] = useState(false);

  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load questions:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('gun_exam_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('gun_exam_stats', JSON.stringify(stats));
  }, [stats]);

  // Exam timer
  useEffect(() => {
    let timer;
    if (examActive && !examSubmitted && examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examActive, examSubmitted, examTimeLeft]);

  const toggleBookmark = (qId) => {
    setBookmarks(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const recordAnswerResult = (qId, isCorrect) => {
    setStats(prev => {
      const qHist = prev.questionHistory[qId] || { correct: 0, incorrect: 0 };
      if (isCorrect) qHist.correct += 1;
      else qHist.incorrect += 1;
      return {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        questionHistory: {
          ...prev.questionHistory,
          [qId]: qHist
        }
      };
    });
  };

  // Start official exam simulation (40 random questions from the pool, 40 mins)
  const startExam = () => {
    // Shuffle and pick 40
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 40);
    setExamQuestions(selected);
    setExamIndex(0);
    setExamAnswers({});
    setExamSubmitted(false);
    setExamTimeLeft(40 * 60);
    setExamActive(true);
    setActiveTab('exam');
  };

  const submitExam = () => {
    setExamSubmitted(true);
    // Calculate score
    let correctCount = 0;
    examQuestions.forEach(q => {
      const userAns = examAnswers[q.id] || [];
      const correctAns = Object.keys(q.options).filter(k => q.options[k].correct);
      const isCorrect = userAns.length === correctAns.length && userAns.every(a => correctAns.includes(a));
      if (isCorrect) correctCount++;
    });

    const passed = correctCount >= 36; // 36/40 required to pass (90%)
    setStats(prev => ({
      ...prev,
      completedExams: prev.completedExams + 1,
      passedExams: prev.passedExams + (passed ? 1 : 0)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-slate-300">Ielādē ieroču eksāmena jautājumus (2026)...</p>
        </div>
      </div>
    );
  }

  const sections = Array.from(new Set(questions.map(q => q.section)));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold tracking-tight">Ieroču eksāmens</h1>
              <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">Ieroču un munīcijas aprites kvalifikācijas pārbaudījums</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Sākums"
            >
              <span className="hidden sm:inline">Sākums</span>
              <span className="sm:hidden">🏠</span>
            </button>
            <button 
              onClick={() => { setActiveTab('study'); setStudyIndex(0); setStudyShowResult(false); setStudySelectedAnswers({}); }}
              className={`px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${activeTab === 'study' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Mācīties"
            >
              <span>Mācīties</span> <span className="text-[10px] opacity-80">({questions.length})</span>
            </button>
            <button 
              onClick={startExam}
              className={`px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition flex items-center gap-1 ${activeTab === 'exam' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Eksāmena tests"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> <span className="hidden sm:inline">Eksāmens</span> <span className="sm:hidden">Tests</span>
            </button>
            <button 
              onClick={() => setActiveTab('bookmarks')}
              className={`px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition flex items-center gap-1 ${activeTab === 'bookmarks' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Atzīmētie"
            >
              <Bookmark className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Atzīmētie</span> <span className="text-[10px]">({bookmarks.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition flex items-center gap-1 ${activeTab === 'stats' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Statistika"
            >
              <BarChart3 className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Statistika</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-800/80 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Oficiālie 2026. gada jautājumi
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">Sagatavojies ieroču glabāšanas un nēsāšanas eksāmenam</h2>
                <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
                  Šajā tīmekļa lietotnē apkopoti visi {questions.length} oficiālie Ieroču un munīcijas aprites kvalifikācijas pārbaudījuma jautājumi ar pareizajām atbildēm un detalizētām sadaļām efektīvai mācīšanai un eksāmena nokārtošanai.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={() => { setActiveTab('study'); setStudyIndex(0); }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" /> Sākt mācīties
                </button>
                <button 
                  onClick={startExam}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" /> Eksamena tests
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3.5 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Kopā jautājumi</p>
                  <p className="text-2xl font-bold text-slate-900">{questions.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Nokārtoti eksāmeni</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.passedExams} / {stats.completedExams}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="bg-amber-100 text-amber-600 p-3.5 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Pareizās atbildes</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="bg-rose-100 text-rose-600 p-3.5 rounded-xl">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Atzīmēti jautājumi</p>
                  <p className="text-2xl font-bold text-slate-900">{bookmarks.length}</p>
                </div>
              </div>
            </div>

            {/* Sections Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Eksāmena tēmas un sadaļas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.map((sec, idx) => {
                  const secQuestions = questions.filter(q => q.section === sec);
                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        setStudySection(sec);
                        setStudyIndex(0);
                        setActiveTab('study');
                        setStudyShowResult(false);
                        setStudySelectedAnswers({});
                      }}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition flex justify-between items-center group"
                    >
                      <div className="space-y-1 pr-2">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition">{sec}</p>
                        <p className="text-xs text-slate-500">{secQuestions.length} jautājumi</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STUDY TAB */}
        {activeTab === 'study' && (() => {
          const filteredQuestions = studySection === 'all' 
            ? questions 
            : questions.filter(q => q.section === studySection);

          if (filteredQuestions.length === 0) {
            return (
              <div className="text-center py-16 space-y-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500">Nav atrasts neviens jautājums šajā sadaļā.</p>
                <button onClick={() => setStudySection('all')} className="text-blue-600 font-semibold hover:underline">
                  Skatīt visus jautājumus
                </button>
              </div>
            );
          }

          const currentQ = filteredQuestions[studyIndex] || filteredQuestions[0];
          const selectedAns = studySelectedAnswers[currentQ.id] || [];
          const isBookmarked = bookmarks.includes(currentQ.id);

          const handleSelectOption = (optKey) => {
            // Check if multiple correct answers exist for this question
            const correctKeys = Object.keys(currentQ.options).filter(k => currentQ.options[k].correct);
            const isMultiple = correctKeys.length > 1;

            let newSelected;
            if (isMultiple) {
              if (selectedAns.includes(optKey)) {
                newSelected = selectedAns.filter(k => k !== optKey);
              } else {
                newSelected = [...selectedAns, optKey];
              }
            } else {
              newSelected = [optKey];
            }

            setStudySelectedAnswers(prev => ({
              ...prev,
              [currentQ.id]: newSelected
            }));

            // Auto check correctness if single or when user triggers check
            if (!isMultiple && newSelected.length === 1) {
              setStudyShowResult(true);
              const isCorrect = newSelected[0] === correctKeys[0];
              recordAnswerResult(currentQ.id, isCorrect);
            }
          };

          return (
            <div className="space-y-6 animate-fadeIn">
              {/* Filter & Controls bar */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <select 
                    value={studySection}
                    onChange={(e) => {
                      setStudySection(e.target.value);
                      setStudyIndex(0);
                      setStudyShowResult(false);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
                  >
                    <option value="all">Visas sadaļas ({questions.length})</option>
                    {sections.map((sec, idx) => (
                      <option key={idx} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm font-semibold text-slate-600">
                    Jautājums {studyIndex + 1} no {filteredQuestions.length}
                  </span>
                  <button 
                    onClick={() => toggleBookmark(currentQ.id)}
                    className={`p-2 rounded-xl border transition ${isBookmarked ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}`}
                    title="Atzīmēt jautājumu"
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    {currentQ.section}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    ID: {currentQ.id}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h2>

                <div className="space-y-3">
                  {Object.keys(currentQ.options).map((optKey) => {
                    const opt = currentQ.options[optKey];
                    const isSelected = selectedAns.includes(optKey);
                    const isCorrectOpt = opt.correct;
                    
                    let btnStyle = "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800";
                    if (studyShowResult || Object.keys(currentQ.options).filter(k => currentQ.options[k].correct).length > 1) {
                      if (isCorrectOpt) {
                        btnStyle = "border-emerald-300 bg-emerald-50 text-emerald-900 font-medium";
                      } else if (isSelected && !isCorrectOpt) {
                        btnStyle = "border-rose-300 bg-rose-50 text-rose-900";
                      }
                    } else if (isSelected) {
                      btnStyle = "border-blue-500 bg-blue-50 text-blue-900 font-medium";
                    }

                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(optKey)}
                        className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3.5 ${btnStyle}`}
                      >
                        <span className="font-bold uppercase w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                          {optKey}
                        </span>
                        <p className="flex-1 text-sm sm:text-base leading-relaxed">{opt.text}</p>
                        {studyShowResult && isCorrectOpt && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {studyShowResult && isSelected && !isCorrectOpt && (
                          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Multiple answer submit check button if multiple correct */}
                {Object.keys(currentQ.options).filter(k => currentQ.options[k].correct).length > 1 && !studyShowResult && (
                  <button
                    onClick={() => {
                      setStudyShowResult(true);
                      const correctKeys = Object.keys(currentQ.options).filter(k => currentQ.options[k].correct);
                      const isCorrect = selectedAns.length === correctKeys.length && selectedAns.every(a => correctKeys.includes(a));
                      recordAnswerResult(currentQ.id, isCorrect);
                    }}
                    disabled={selectedAns.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition shadow"
                  >
                    Pārbaudīt atbildi
                  </button>
                )}

                {studyShowResult && (
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedAns.length > 0 && selectedAns.every(a => currentQ.options[a]?.correct) && selectedAns.length === Object.keys(currentQ.options).filter(k => currentQ.options[k].correct).length ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-800">Pareizi!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-600" />
                          <span className="text-sm font-bold text-rose-800">Nepareizi. Pareizā atbilde ir atzīmēta zaļā krāsā.</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (studyIndex > 0) {
                        setStudyIndex(studyIndex - 1);
                        setStudyShowResult(false);
                      }
                    }}
                    disabled={studyIndex === 0}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Iepriekšējais
                  </button>

                  <button
                    onClick={() => {
                      if (studyIndex < filteredQuestions.length - 1) {
                        setStudyIndex(studyIndex + 1);
                        setStudyShowResult(false);
                      }
                    }}
                    disabled={studyIndex === filteredQuestions.length - 1}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow"
                  >
                    Nākamais <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* EXAM TAB */}
        {activeTab === 'exam' && examActive && (
          <div className="space-y-6 animate-fadeIn">
            {!examSubmitted ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-900">Eksāmena Simulācija</h3>
                    <p className="text-xs text-slate-500">40 jautājumi • Lai nokārtotu, jāatbild vismaz uz 36 pareizi (90%)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl font-mono font-bold text-sm ${examTimeLeft < 300 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
                      ⏱️ {Math.floor(examTimeLeft / 60)}:{('0' + (examTimeLeft % 60)).slice(-2)}
                    </div>
                    <span className="text-sm font-semibold text-slate-600">
                      {examIndex + 1} / {examQuestions.length}
                    </span>
                  </div>
                </div>

                {(() => {
                  const currentQ = examQuestions[examIndex];
                  const userAns = examAnswers[currentQ.id] || [];

                  const handleExamSelect = (optKey) => {
                    const correctKeys = Object.keys(currentQ.options).filter(k => currentQ.options[k].correct);
                    const isMultiple = correctKeys.length > 1;
                    let newAns;
                    if (isMultiple) {
                      newAns = userAns.includes(optKey) ? userAns.filter(k => k !== optKey) : [...userAns, optKey];
                    } else {
                      newAns = [optKey];
                    }
                    setExamAnswers(prev => ({
                      ...prev,
                      [currentQ.id]: newAns
                    }));
                  };

                  return (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                          {currentQ.section}
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                        {currentQ.question}
                      </h2>

                      <div className="space-y-3">
                        {Object.keys(currentQ.options).map((optKey) => {
                          const opt = currentQ.options[optKey];
                          const isSelected = userAns.includes(optKey);
                          return (
                            <div
                              key={optKey}
                              onClick={() => handleExamSelect(optKey)}
                              className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3.5 ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'}`}
                            >
                              <span className="font-bold uppercase w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                                {optKey}
                              </span>
                              <p className="flex-1 text-sm sm:text-base leading-relaxed">{opt.text}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Question jump dots */}
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-500 mb-2">Jautājumi:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {examQuestions.map((q, i) => (
                            <button
                              key={q.id}
                              onClick={() => setExamIndex(i)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition ${examIndex === i ? 'ring-2 ring-blue-600 bg-blue-600 text-white' : examAnswers[q.id]?.length > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <button
                          onClick={() => setExamIndex(Math.max(0, examIndex - 1))}
                          disabled={examIndex === 0}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          Iepriekšējais
                        </button>

                        {examIndex < examQuestions.length - 1 ? (
                          <button
                            onClick={() => setExamIndex(examIndex + 1)}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow"
                          >
                            Nākamais
                          </button>
                        ) : (
                          <button
                            onClick={submitExam}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" /> Iesniegt Eksāmenu
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Exam Results View */
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
                {(() => {
                  let correctCount = 0;
                  examQuestions.forEach(q => {
                    const userAns = examAnswers[q.id] || [];
                    const correctAns = Object.keys(q.options).filter(k => q.options[k].correct);
                    if (userAns.length === correctAns.length && userAns.every(a => correctAns.includes(a))) {
                      correctCount++;
                    }
                  });
                  const passed = correctCount >= 18;
                  const percentage = Math.round((correctCount / examQuestions.length) * 100);

                  return (
                    <div className="space-y-6 max-w-xl mx-auto">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl shadow-md ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {passed ? '🏆' : '❌'}
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-slate-900">
                          {passed ? 'Apsveicam! Eksāmens nokārtots!' : 'Eksāmens nav nokārtots'}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {passed ? 'Jūs esat veiksmīgi pierādījis zināšanas un prasības.' : 'Nepieciešams vismaz 36 pareizas atbildes (90%). Mēģiniet vēlreiz!'}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Rezultāts</p>
                          <p className="text-2xl font-bold text-slate-900">{correctCount} / {examQuestions.length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Procenti</p>
                          <p className={`text-2xl font-bold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{percentage}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Statuss</p>
                          <p className={`text-lg font-extrabold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {passed ? 'OK' : 'FAIL'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-center pt-4">
                        <button
                          onClick={startExam}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow transition"
                        >
                          Mēģināt vēlreiz
                        </button>
                        <button
                          onClick={() => setActiveTab('dashboard')}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-6 py-3 rounded-xl transition"
                        >
                          Atgriezties sākumā
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Atzīmētie Jautājumi</h3>
                <p className="text-xs text-slate-500">Jautājumi, kurus esat saglabājis atkārtotai apskatei ({bookmarks.length})</p>
              </div>
            </div>

            {bookmarks.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-3">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-600 font-medium">Nav atzīmētu jautājumu</p>
                <p className="text-xs text-slate-400">Jūs varat atzīmēt jebkuru jautājumu mācību režīmā, spiežot uz grāmatzīmes ikonas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((qId) => {
                  const q = questions.find(item => item.id === qId);
                  if (!q) return null;
                  return (
                    <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                          {q.section} (ID: {q.id})
                        </span>
                        <button 
                          onClick={() => toggleBookmark(q.id)}
                          className="text-amber-500 hover:text-rose-500 transition"
                        >
                          <Bookmark className="w-5 h-5 fill-current" />
                        </button>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">{q.question}</h3>

                      <div className="space-y-2">
                        {Object.keys(q.options).map(optKey => {
                          const opt = q.options[optKey];
                          return (
                            <div 
                              key={optKey}
                              className={`p-3 rounded-xl border text-sm flex items-start gap-3 ${opt.correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                            >
                              <span className="font-bold uppercase w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center text-xs flex-shrink-0">
                                {optKey}
                              </span>
                              <p className="flex-1">{opt.text}</p>
                              {opt.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Mācību Statistika un Progresa Pārskats</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Atrisinātie Jautājumi (Kopā)</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalAnswered}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Pareizās Atbildes</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.correctAnswers}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Nokārtoti Eksameni</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{stats.passedExams} / {stats.completedExams}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => {
                    if (confirm('Vai tiešām vēlaties atiestatīt statistiku?')) {
                      setStats({
                        completedExams: 0,
                        passedExams: 0,
                        totalAnswered: 0,
                        correctAnswers: 0,
                        questionHistory: {}
                      });
                      setBookmarks([]);
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition border border-rose-200"
                >
                  Atiestatīt statistiku
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 mt-12 border-t border-slate-800 text-xs text-center space-y-2">
        <p className="max-w-3xl mx-auto px-4 leading-relaxed">
          <strong className="text-slate-300">Brīdinājums:</strong> šis rīks ir informatīvs un domāts tikai sevis izglītībai. Tas nepretendē uz absolūtu patiesību un negarantē, ka jūs noliksiet VP ieroču glabāšanas un nēsāšanas eksāmenu. Papildus informācija par eksāmenu pieejama <a href="https://www.vp.gov.lv/lv/informacija-par-ierocu-un-municijas-aprites-un-prasmju-rikoties-ar-ieroci-kvalifikacijas-parbaudijumu" target="_blank" rel="noopener" className="text-blue-400 hover:underline ml-1">šeit</a>.
        </p>
        <p className="credit">
          MIT licenze · Izstrādājis
          <a href="https://estivador.io" target="_blank" rel="noopener" className="text-blue-400 hover:underline ml-1">Reinholds Zviedris</a>
          · <a href="https://github.com/zxpower/lv-gun-exam" target="_blank" rel="noopener" className="text-blue-400 hover:underline ml-1">Pirmkods</a>
        </p>
      </footer>
    </div>
  );
}
