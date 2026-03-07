
CREATE OR REPLACE FUNCTION public.validate_beneficiary_french()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  combined_text text;
  english_words text[] := ARRAY[' the ', ' and ', ' is ', ' are ', ' was ', ' were ', ' has ', ' have ', ' his ', ' her ', ' with ', ' from ', ' that ', ' this ', ' been ', ' would ', ' could ', ' should ', ' their ', ' which '];
  word text;
BEGIN
  combined_text := ' ' || lower(COALESCE(NEW.short_story, '')) || ' ' || lower(COALESCE(NEW.emotional_sentence, '')) || ' ';
  
  FOREACH word IN ARRAY english_words LOOP
    IF combined_text LIKE '%' || word || '%' THEN
      RAISE EXCEPTION 'Les textes des bénéficiaires doivent être rédigés en français. Mot anglais détecté : "%".', trim(word)
        USING HINT = 'Veuillez traduire short_story et emotional_sentence en français.';
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_beneficiary_french
  BEFORE INSERT OR UPDATE OF short_story, emotional_sentence ON public.beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_beneficiary_french();
