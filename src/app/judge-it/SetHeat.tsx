import React, { useState, useMemo } from "react";
import { FormControl, TextField, Button } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Heat, AlertContext } from "@/types";
import { Id } from "convex/_generated/dataModel";

interface SetHeatProps {
  heats: Heat[];
}

const SetHeat: React.FC<SetHeatProps> = ({ heats = [] }) => {
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<"error" | "success">(
    "error",
  );
  const [alertText, setAlertText] = useState<string>("");
  const [alertContext, setAlertContext] = useState<AlertContext | undefined>();
  const [heatNumber, setHeatNumber] = useState<string>("");

  const createHeatMutation = useMutation(api.mutations.createHeat);
  const setCurrentHeat = useMutation(api.mutations.setCurrentHeat);

  const getCurYear = (): number => {
    return new Date().getFullYear();
  };

  const thisYearsHeats = useMemo(
    () =>
      heats.filter(
        (heat: Heat) => new Date(heat.date).getFullYear() === getCurYear(),
      ),
    [heats],
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
    try {
      // setCurrentHeat with null ID will unset all heats
      // Actually we don't need this - setCurrentHeat mutation already unsets others
      return undefined;
    } catch (error) {
      const err = "Error updating current heat: " + (error as Error).message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      setAlertContext({
        operation: "set_heat",
        location: "SetHeat.setNotCurrentHeat",
        metadata: {
          step: "update_current_heat_to_false",
        },
      });
      return "error";
    }
  };

  const createHeat = async (
    heatNumber: number,
  ): Promise<string | undefined> => {
    try {
      const newHeatId = await createHeatMutation({
        name: `Heat ${heatNumber}`,
        heat: heatNumber,
        date: new Date().toISOString().split("T")[0],
        is_current: false,
      });
      // Now set it as current
      await setCurrentHeat({ id: newHeatId as Id<"heats"> });
      return undefined;
    } catch (error) {
      const err = "Error creating heat: " + (error as Error).message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      setAlertContext({
        operation: "set_heat",
        location: "SetHeat.createHeat",
        metadata: {
          step: "insert_new_heat",
          heatNumber,
        },
      });
      return "error";
    }
  };

  const updateHeat = async (
    heatNumber: number,
  ): Promise<string | undefined> => {
    try {
      // Find the heat by number
      const heat = heats.find((h) => h.heat === heatNumber);
      if (!heat) {
        throw new Error(`Heat ${heatNumber} not found`);
      }
      // Set it as current (automatically unsets others)
      await setCurrentHeat({ id: heat.id as unknown as Id<"heats"> });
      return undefined;
    } catch (error) {
      const err = "Error updating heat: " + (error as Error).message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      setAlertContext({
        operation: "set_heat",
        location: "SetHeat.updateHeat",
        metadata: {
          step: "update_heat_to_current",
          heatNumber,
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
        `Click OK if you sure you want to reuse heat ${heatNumber}.\nThe natural heat progression would be to use ${nextNaturalHeat} now.`,
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
