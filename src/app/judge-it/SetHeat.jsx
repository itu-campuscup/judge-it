import { useState, useEffect } from "react";
import { FormControl, TextField, Button } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import { supabase } from "@/SupabaseClient";
import { HEATS_TABLE } from "@/utils/constants";

const SetHeat = ({ user }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [alertText, setAlertText] = useState("");
  const [heats, setHeats] = useState([]);
  const [heatNumber, setHeatNumber] = useState("");

  useEffect(() => {
    if (user) {
      const fetchHeats = async () => {
        const { data, error } = await supabase.from(HEATS_TABLE).select("*");
        if (error) {
          const err = "Error fetching heats:" + error.message;
          setAlertOpen(true);
          setAlertSeverity("error");
          setAlertText(err);
          console.error(err);
        } else {
          setHeats(data);
        }
      };

      fetchHeats();

      const heatsListener = supabase
        .channel("public:heats")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: HEATS_TABLE },
          fetchHeats
        )
        .subscribe();

      return () => {
        supabase.removeChannel(heatsListener);
      };
    }
  }, [user]);

  const getCurYear = () => {
    return new Date().getFullYear();
  };

  const getThisYearsHeats = () => {
    return heats.filter(
      (heat) => new Date(heat.date).getFullYear() === getCurYear()
    );
  };

  const hasHeatBeenUsed = (heatNumber) => {
    const thisYearsHeats = getThisYearsHeats();
    const hasFound = thisYearsHeats.some((heat) => heat.heat === heatNumber);
    return hasFound;
  };

  const getNextNaturalHeat = () => {
    const thisYearsHeats = getThisYearsHeats();
    if (thisYearsHeats.length === 0) {
      return 1;
    }

    thisYearsHeats.sort((a, b) => a.heat - b.heat);
    return thisYearsHeats[thisYearsHeats.length - 1].heat + 1;
  };

  const setNotCurrentHeat = async () => {
    const { error } = await supabase
      .from(HEATS_TABLE)
      .update({ is_current: false })
      .eq("is_current", true);
    if (error) {
      const err = "Error updating current heat: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      console.error(err);
      return "error";
    }
  };

  const createHeat = async (heatNumber) => {
    const { error } = await supabase
      .from(HEATS_TABLE)
      .insert([{ heat: heatNumber, is_current: true }]);
    if (error) {
      const err = "Error creating heat: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      console.error(err);
      return "error";
    }
  };

  const updateHeat = async (heatNumber) => {
    const { error } = await supabase
      .from(HEATS_TABLE)
      .update({ is_current: true })
      .eq("heat", heatNumber);
    if (error) {
      const err = "Error updating heat: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      console.error(err);
      return "error";
    }
  };

  const handleSetHeat = async (heatNumber) => {
    heatNumber = parseInt(heatNumber);
    if (hasHeatBeenUsed(heatNumber)) {
      const nextNaturalHeat = getNextNaturalHeat();
      const confirmReuse = window.confirm(
        `Click OK if you sure you want to reuse heat ${heatNumber}.\nThe natural heat progression would be to use ${nextNaturalHeat} now.`
      );
      if (!confirmReuse) {
        return;
      }
      const setNotCurrentHeatResult = await setNotCurrentHeat();
      if (setNotCurrentHeatResult === "error") {
        return;
      }
      const updateHeatResult = await updateHeat(heatNumber);
      if (updateHeatResult === "error") {
        return;
      }
    } else {
      const setNotCurrentHeatResult = await setNotCurrentHeat();
      if (setNotCurrentHeatResult === "error") {
        return;
      }
      const createHeatResult = await createHeat(heatNumber);
      if (createHeatResult === "error") {
        return;
      }
    }

    setAlertOpen(true);
    setAlertSeverity("success");
    setAlertText(`Heat ${heatNumber} set`);
  };

  return (
    <>
      <AlertComponent
        severity={alertSeverity}
        text={alertText}
        open={alertOpen}
        setOpen={setAlertOpen}
      />
      <FormControl fullWidth margin="normal" variant="filled">
        <TextField
          id="heat-number"
          type="number"
          label={`Natural heat progression: ${getNextNaturalHeat()}`}
          value={heatNumber}
          onChange={(e) => setHeatNumber(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSetHeat(heatNumber)}
        >
          Set Heat
        </Button>
      </FormControl>
    </>
  );
};

export default SetHeat;
