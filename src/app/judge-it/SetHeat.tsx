import React, { useState, useEffect, useMemo } from "react";
import { FormControl, TextField, Button } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import { supabase } from "@/SupabaseClient";
import { HEATS_TABLE } from "@/utils/constants";
import type { Heat, AlertContext } from "@/types";

interface SetHeatProps {
  user: any;
  heats: Heat[];
}

const SetHeat: React.FC<SetHeatProps> = ({ user, heats = [] }) => {
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<"error" | "success">(
    "error"
  );
  const [alertText, setAlertText] = useState<string>("");
  const [alertContext, setAlertContext] = useState<AlertContext | undefined>();
  const [heatNumber, setHeatNumber] = useState<string>("");

  const getCurYear = (): number => {
    return new Date().getFullYear();
  };

  const thisYearsHeats = useMemo(
    () =>
      heats.filter(
        (heat: Heat) => new Date(heat.date).getFullYear() === getCurYear()
      ),
    [heats]
  );

  const getThisYearsHeats = (): Heat[] => {
    return thisYearsHeats;
  };

  const hasHeatBeenUsed = (heatNumber: number): boolean => {
    const thisYearsHeats = getThisYearsHeats();
    const hasFound = thisYearsHeats.some((heat) => heat.heat === heatNumber);
    return hasFound;
  };

  const getNextNaturalHeat = (): number => {
    const thisYearsHeats = getThisYearsHeats();
    if (thisYearsHeats.length === 0) {
      return 1;
    }

    thisYearsHeats.sort((a, b) => a.heat - b.heat);
    return thisYearsHeats[thisYearsHeats.length - 1].heat + 1;
  };

  const setNotCurrentHeat = async (): Promise<string | undefined> => {
    const { error } = await supabase
      .from(HEATS_TABLE)
      .update({ is_current: false })
      .eq("is_current", true);
    if (error) {
      const err = "Error updating current heat: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      setAlertContext({
        operation: "set_heat",
        location: "SetHeat.setNotCurrentHeat",
        metadata: {
          step: "update_current_heat_to_false",
          errorCode: error.code,
        },
      });
      return "error";
    }
  };

  const createHeat = async (
    heatNumber: number
  ): Promise<string | undefined> => {
    const { error } = await supabase
      .from(HEATS_TABLE)
      .insert([{ heat: heatNumber, is_current: true }]);
    if (error) {
      const err = "Error creating heat: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      setAlertContext({
        operation: "set_heat",
        location: "SetHeat.createHeat",
        metadata: {
          step: "insert_new_heat",
          heatNumber,
          errorCode: error.code,
        },
      });
      return "error";
    }
  };

  const updateHeat = async (
    heatNumber: number
  ): Promise<string | undefined> => {
    const { error } = await supabase
      .from(HEATS_TABLE)
      .update({ is_current: true })
      .eq("heat", heatNumber);
    if (error) {
      const err = "Error updating heat: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      setAlertContext({
        operation: "set_heat",
        location: "SetHeat.updateHeat",
        metadata: {
          step: "update_heat_to_current",
          heatNumber,
          errorCode: error.code,
        },
      });
      return "error";
    }
  };

  const handleSetHeat = async (heatNumberString: string): Promise<void> => {
    const heatNumber = parseInt(heatNumberString);
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
    setAlertContext({
      operation: "set_heat",
      location: "SetHeat.handleSetHeat",
      metadata: {
        heatNumber,
        wasReused: hasHeatBeenUsed(heatNumber),
      },
    });
  };

  return (
    <>
      <AlertComponent
        severity={alertSeverity}
        text={alertText}
        open={alertOpen}
        setOpen={setAlertOpen}
        context={alertContext}
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
