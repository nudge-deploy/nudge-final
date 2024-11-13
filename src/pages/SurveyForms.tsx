import { useEffect, useRef, useState } from "react";
import supabase from "../database/supabaseClient"
import { Question, SurveyType, UserResponse } from "../interface/SurveyInterface";
import { useGetUser } from "../hooks/useGetUser";
import { useSession } from "../context/SessionContext";
import { Link } from "react-router-dom";

// metode jawab: pilih jawaban, trigger opsi "change answer" enabled,
// change_answer onclick -> delete record jawaban from that question
// user pilih jawaban lagi

export default function SurveyForms() {

  const { userId } = useGetUser();
  const { user } = useSession();
  console.log('logged in user: ', user);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyTypes, setSurveyTypes] = useState<SurveyType[]>([]);
  const [currentSurveyType, setCurrentSurveyType] = useState<string>('');
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<{[key: string]: string[] }>({}); 
  const [answered, setAnswered] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [sebutkan, setSebutkan] = useState(false);

  // single-select, sebutkan
  const [singleSebutkan, setSingleSebutkan] = useState(false);

  // sebutkanAnswer mapped by question_id
  const [sebutkanAnswer, setSebutkanAnswer] = useState<{[key: string]: string}>({});

  // debounce timer for multi_select submissions
  // const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  // const [multiSelectLoading, setMultiSelectLoading] = useState(false);

  // scroll ref every next and prev
  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function fetchQuestions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*');
    
    if(data) {
      console.log('questions data: ', data);
      setQuestions(data);
      setLoading(false);
    }
    if(error) {
      console.log('error while fetch questions');
    }
  }

  async function fetchSurveyTypes() {
    const { data, error } = await supabase
      .from('survey_types')
      .select('*');
    if(data) {
      console.log('survey type data: ', data);
      setSurveyTypes(data);
    }
    if(error) {
      console.log('error while fetching survey types: ', error);
    }
  }
  
  async function postSingleSelectAnswer({ question_id, response } : UserResponse) {
    setSelectedOption((prevSelectedOption) => ({
      ...prevSelectedOption,
      [question_id]: response, // Set the selected option for the corresponding question
    }));
    const { data, error } = await supabase
      .from('user_responses')
      .upsert(
        {
          user_id: userId,
          question_id: question_id,
          response: response,
        },  
      )
      .select();
    
    if(data) {
      console.log('success data response: ', data);
      handleQuestionAnswered(question_id, true);
    }
    if(error) {
      console.log('error while submitting response', error);
    }
  }

  // Post Multi-Select Answer
  async function postMultiSelectAnswer({ question_id, response }: UserResponse) {
    if (!Array.isArray(response)) {
      console.log("Response for multi-select must be an array.");
      return;
    }

    const sebutkanResponse = sebutkanAnswer[question_id] ? [sebutkanAnswer[question_id]] : [];
    console.log('sebutkan response: ', sebutkanResponse);
    const finalResponse = [...response, ...sebutkanResponse];
    console.log('final response: ', finalResponse);

    const cleanResponse = finalResponse.filter(item => item !== 'Produk keuangan lainnya (Harap sebutkan)');
    console.log('clean response: ', cleanResponse);

    setSelectedOption((prevSelectedOption) => ({
      ...prevSelectedOption,
      [question_id]: cleanResponse,
    }));

    const { data, error } = await supabase.from("user_responses").upsert(
      {
        user_id: userId,
        question_id: question_id,
        response: cleanResponse,
      }
    ).select();

    if (data) {
      console.log("Multi-select response saved successfully:", data);
      handleQuestionAnswered(question_id, true);
    }
    if (error) {
      console.log("Error submitting multi-select response:", error);
    }
  }

  // Toggle Multi-Select Answer
  const toggleMultiSelectAnswer = (question_id: string, option: string) => {
    console.log('toggle answer: ', option);
    setSelectedOption((prevSelectedOption) => {
      const currentSelection = prevSelectedOption[question_id] || [];
      const newSelection = currentSelection.includes(option)
        ? currentSelection.filter((item) => item !== option)
        : [...currentSelection, option];
      // console.log('current selection: ', currentSelection);
      console.log('new selection type: ', newSelection);

      return { ...prevSelectedOption, [question_id]: newSelection };
    });
  };

  // useEffect(() => {
  //   // Only proceed if there's a question ID to submit
  //   const questionId = Object.keys(selectedOption).find(id => !answered[id]);
  //   if (!questionId) return;

  //   if (debounceTimer.current) {
  //     clearTimeout(debounceTimer.current);
  //   }
  //   console.log('SELECTED OPTION ON USEEFFECT: ', selectedOption);
  //   setMultiSelectLoading(true);
  //   debounceTimer.current = setTimeout(() => {
  //     postMultiSelectAnswer({
  //       question_id: questionId,
  //       response: selectedOption[questionId] || [],
  //     });
  //   }, 5000);

  //   return () => {
  //     if (debounceTimer.current) {
  //       clearTimeout(debounceTimer.current);
  //     }
  //   };
  // }, [selectedOption]);
  
  const fetchCurrentUserResponses = async () => {
    setLoading(true); 
    const { data, error } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', userId)
    
    if(data) {
      console.log('responses data: ', data);
      const updateSelectedOptions = (data: UserResponse) => {
        setSelectedOption((prevSelectedOption) => ({
          ...prevSelectedOption,
          [data.question_id]: data.response,
        }));
        setAnswered((prevAnswered) => ({
          ...prevAnswered,
          [data.question_id]: true,
        }));
        // setSebutkanAnswer((prevSebutkan) => ({
        //   ...prevSebutkan,
        //   [data.question_id]: 
        // }))
      };
      
      for (const response of data) {
        const matchingQuestion = questions.find(
          (question) => question.id === response.question_id
        );
        if (matchingQuestion) {
          updateSelectedOptions(response);
          console.log('matching questions');
        }
      }

      // if true, this sets to input field, else a harap sebutkan string
      // setSebutkan(true);
      setLoading(false);
    }
    if(error) {
      console.log('error while fetching responses', error);
    }
  }
  
  const handleChangeAnswer = async (question_id: string) => {
    const { error } = await supabase
    .from('user_responses')
    .delete()
    .eq('question_id', question_id)
    .eq('user_id', userId)
    
    if(error) {
      console.log('error while change answer', error)
    } else {
      console.log('successful change answer');
      // Clear the selected option for the specific question
      setSelectedOption((prevSelectedOption) => {
        const updatedOptions = { ...prevSelectedOption };
        delete updatedOptions[question_id]; // Remove the entry for this question
        return updatedOptions;
      });

      // Also set the answered state to false for this question
      setAnswered((prevAnswered) => ({
        ...prevAnswered,
        [question_id]: false, // Mark this question as not answered
      }));

      // biar ga ketrigger kebalik2 statenya
      setSebutkan(false);

      // kalo change answer, kosongin si sebutkan
      // setSebutkanAnswer({});
    }
  }

  const handleQuestionAnswered = (question_id: string, isAnswered: boolean) => {
    console.log('masuk handle question answered');
    setAnswered((prevAnswered) => ({
      ...prevAnswered,
      [question_id]: isAnswered, // Set the selected option for the corresponding question
    }));
  }

  // pagination by survey types
  const handleNext = () => {
    if(index < surveyTypes.length) {
      setIndex(index + 1);
      setCurrentSurveyType(surveyTypes[index].type_name);
      scrollToTop();
      console.log('handle next')
    }
  }

  const handlePrevious = () => {
    if(surveyTypes.length > 0) {
      setIndex(index - 1)
      setCurrentSurveyType(surveyTypes[index].type_name);
      scrollToTop();
    }
  }

  const scrollToTop = () => {
    console.log('scrolled to top 1')
    if (scrollRef.current) {
      console.log('scrolled to top 2')
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleUserFinishSurvey = async (has_finished: boolean) => {
    if(userId) {
      const { data, error } = await supabase
        .from('user_finish_surveys')
        .insert({
          user_id: userId,
          has_finished: has_finished
        })
      
      if(error) {
        console.log('error while user finish survey: ', error);
      }
      if(data) {
        console.log('successful user finish survey: ', data[0]);
      }
    }
  }

  useEffect(() => {
    fetchQuestions();
    fetchSurveyTypes();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      fetchCurrentUserResponses();
    }
  }, [questions, userId]);

  useEffect(() => {
    if(surveyTypes.length > 0) {
      setCurrentSurveyType(surveyTypes[index].type_name);
    }
  }, [surveyTypes, index])

  useEffect(() => {
    questions.map((question) => {
      surveyTypes.map((surveyType) => {
        if(question.survey_type_id == surveyType.id) {
          console.log('survey name: ', surveyType.type_name);
          question.survey_type_name = surveyType.type_name;
        }
      })
    })
  }, [questions, surveyTypes])

  console.log('sebutkan state: ', sebutkan);
  
  if(loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-slate-100">
        <span className="loading loading-spinner"></span>
      </div>
    )
  }
  return (
    <div className="flex flex-col justify-center items-center p-3 bg-slate-100 text-slate-800 min-h-screen">
      <div className="border border-1 p-4 w-1/2 max-mobile:w-full max-tablet:w-full">
        <div ref={scrollRef} className="text-xl font-bold">{currentSurveyType}</div>
        <div className="flex flex-col overflow-auto">
          {
            questions
              .filter((question) => question.survey_type_name == currentSurveyType)
              .map((question) => {
                return (
                  <div key={question.id} className="flex flex-col space-y-2 mt-4">
                    <div className="flex flex-row items-start space-x-2">
                      <div className="text-base font-bold">{question.question_text}</div>
                      {
                        answered[question.id] ?
                        <div onClick={() => handleChangeAnswer(question.id)} className="btn bg-slate-100 btn-sm text-xs text-slate-800 font-light">Change Answer</div>
                        :
                        <div></div>
                      }
                      {
                        question.question_type == 'multi_select' &&
                          <button
                            className="btn btn-sm bg-success text-slate-100 text-xs font-medium"
                            onClick={() =>
                              postMultiSelectAnswer({ question_id: question.id, response: selectedOption[question.id] || [] })
                            }
                            disabled={answered[question.id]}
                          >
                            Submit
                          </button>
                      }
                    </div>
                    {
                      question.question_type == 'multi_select' ?
                        question.options.map((option, index) => (
                          <div>
                              <div className="flex flex-row items-center space-x-2" key={index}>
                                <input
                                  type="checkbox"
                                  className="checkbox border-1 border-secondary"
                                  checked={
                                    selectedOption[question.id]?.includes(option) || false
                                  }
                                  onChange={
                                    () => {
                                      if(option.includes('sebutkan')) {
                                        setSebutkan(!sebutkan);
                                      }
                                      toggleMultiSelectAnswer(question.id, option);
                                    }
                                  }
                                  disabled={answered[question.id]}
                                />
                                {option.includes('sebutkan') 
                                  ?
                                  <div>
                                    {
                                      sebutkan ?
                                        <input 
                                          type="text" 
                                          className="p-1 border border-slate-600 bg-slate-100"
                                          value={sebutkanAnswer[question.id]}
                                          onChange={(e) => setSebutkanAnswer((prev) => ({ ...prev, [question.id]: e.target.value}))}
                                        />
                                      :
                                        "Produk keuangan lain (Harap sebutkan)"
                                    }
                                  </div> 
                                  :
                                  <div>
                                    {option}
                                  </div>
                                }
                              </div>
                            </div>
                          ))
                      :
                        question.options.map((option, index) => (
                          <div 
                            key={index} 
                            onClick={ 
                              () => {
                                postSingleSelectAnswer({ question_id: question.id, response: [option] });
                                if(option.includes('sebutkan')) {
                                  setSingleSebutkan(!singleSebutkan);
                                }
                              }
                            } 
                            className="flex flex-row space-x-2 items-center">
                            <button 
                              // disabled={answered[question.id]} 
                              className={`btn btn-circle btn-xs border-1 border-slate-700 ${selectedOption[question.id]?.includes(option) ? "bg-primary" : "bg-transparent"} ${answered[question.id] && "border-1 border-white"}`}>
                            </button>
                            {
                              option.includes('sebutkan') ?
                                <div>
                                  {
                                    singleSebutkan ?
                                      <input 
                                        type="text" 
                                        className="p-1 border border-slate-600 bg-slate-100"
                                        // value={sebutkanAnswer[question.id]}
                                        // onChange={(e) => setSebutkanAnswer((prev) => ({ ...prev, [question.id]: e.target.value}))}
                                      />
                                    :
                                      "Produk keuangan lain (Harap sebutkan)"
                                  }
                                </div> 
                              :
                                <div>
                                  {option}
                                </div>
                            }
                          </div>
                        ))
                    }
                  </div>
                )
            })
          }
        </div>
      </div>
      <div className="flex flex-col justify-center items-center space-y-3 mt-3">
        <div className="flex flex-row space-x-1">
          {
            surveyTypes.map((type, idx) => (
              <div key={type.id} className={`w-5 h-2 rounded-full border-2 ${
                idx <= index ? 'bg-slate-700' : ''
              } border-slate-700`}></div>
            ))
          }
        </div>
        {/* <div>{index+1} of {surveyTypes.length-1}</div> */}
      </div>
      <div className="flex flex-col space-y-2 mt-3">
        {index === surveyTypes.length - 1 && <Link to='/simulation' onClick={() => handleUserFinishSurvey(true)} className="btn btn-primary text-sm text-slate-100 font-bold">Submit. Go to simulation</Link>}
        <div className="flex flex-row p-3 space-x-2">
          <button disabled={index == 0 && true} onClick={handlePrevious} className="btn btn-secondary text-slate-100 text-sm font-bold">Previous</button>
          <button disabled={index == surveyTypes.length - 1 && true} onClick={handleNext} className="btn btn-primary text-slate-100 text-sm font-bold">Next</button>
        </div>
      </div>
    </div>
  )
}