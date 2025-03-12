
CREATE OR REPLACE FUNCTION public.calculate_nps_metrics(survey_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    total_responses INTEGER;
    promoters INTEGER;
    passives INTEGER;
    detractors INTEGER;
    nps_score NUMERIC;
BEGIN
    -- Contar total de respostas
    SELECT COUNT(*) INTO total_responses
    FROM nps_responses
    WHERE nps_responses.survey_id = calculate_nps_metrics.survey_id;

    -- Contar promoters (9-10)
    SELECT COUNT(*) INTO promoters
    FROM nps_responses
    WHERE nps_responses.survey_id = calculate_nps_metrics.survey_id
    AND score >= 9;

    -- Contar passives (7-8)
    SELECT COUNT(*) INTO passives
    FROM nps_responses
    WHERE nps_responses.survey_id = calculate_nps_metrics.survey_id
    AND score BETWEEN 7 AND 8;

    -- Contar detractors (0-6)
    SELECT COUNT(*) INTO detractors
    FROM nps_responses
    WHERE nps_responses.survey_id = calculate_nps_metrics.survey_id
    AND score <= 6;

    -- Calcular NPS
    IF total_responses > 0 THEN
        nps_score := (((promoters::NUMERIC / total_responses) * 100) - 
                      ((detractors::NUMERIC / total_responses) * 100))::NUMERIC(5,2);
    ELSE
        nps_score := 0;
    END IF;

    RETURN json_build_object(
        'total_responses', total_responses,
        'promoters', promoters,
        'passives', passives,
        'detractors', detractors,
        'nps_score', nps_score,
        'promoters_percentage', CASE WHEN total_responses > 0 
            THEN round((promoters::NUMERIC / total_responses) * 100, 2)
            ELSE 0 END,
        'passives_percentage', CASE WHEN total_responses > 0 
            THEN round((passives::NUMERIC / total_responses) * 100, 2)
            ELSE 0 END,
        'detractors_percentage', CASE WHEN total_responses > 0 
            THEN round((detractors::NUMERIC / total_responses) * 100, 2)
            ELSE 0 END
    );
END;
$$;
